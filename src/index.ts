/* eslint-disable @typescript-eslint/no-empty-function */
// ^ I can get rid of that if I switch bun.serve to use the "fetch (req) property instead of routes."
// then websocket empty functions can go away
import { OAuth2Client } from 'google-auth-library';

import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    HOST,
    GOOGLE_CREDENTIALS_PATH,
} from './configuration';
import { getHtmlResponse } from './utils/html';
import {
    getAllUnprocessedChaseEmails,
    getGmailClient,
    getInboxContents,
    markEmailAsProcessed,
} from './gmail/gmail';

import cron from 'node-cron';
import { chaseEmailToTransaction, runChaseJob } from './utils/chase';
import { gmail_v1 } from 'googleapis';
import { logError, logInfo, logSuccess } from './utils/logging';
import type { EMail } from './types';
import { sendMessageFromBot } from './utils/telegram';

export const oAuth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${HOST}/auth/oauth2callback`,
);

/*
1. visit /auth/signin
2. follow the link an allow access to your google account
3. as a result "token.json" is written to configured path
4. "token.json" is what the app relies on, and must be mounted in the docker container

"""
Typically, Google refresh tokens remain valid for 6 months, 
are manually revoked, or the user’s password changes. 
A one-week gap in usage won’t invalidate a refresh token.
"""
*/

const loadToken = async () => {
    const tokenFile = Bun.file(GOOGLE_CREDENTIALS_PATH);
    if (await tokenFile.exists()) {
        logInfo('prior google oauth token loaded');
        const tokenText = await tokenFile.text();
        const token = JSON.parse(tokenText);
        oAuth2Client.setCredentials(token);
        return getHtmlResponse(
            `<p>You're already signed in ✅</p><a href="/mail">Check Mail</a>`,
        );
    }
};
loadToken();

Bun.serve({
    development: true, // i want the error log always
    websocket: {
        message() {},
        open() {},
        close() {},
    },
    routes: {
        '/api/status': new Response('OK'),

        '/auth/signin': async (req) => {
            const { searchParams } = new URL(req.url);
            const reset = searchParams.get('reset');
            if (!reset) {
                return (
                    (await loadToken()) ||
                    getHtmlResponse(`<p>Error loading token</p>`)
                );
            } else {
                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: ['https://mail.google.com/'],
                    prompt: 'consent', // include refresh token
                });
                return getHtmlResponse(
                    `<p>Please visit <a href="${authUrl}">this google sign in</a></p>`,
                );
            }
        },
        '/auth/oauth2callback': async (req) => {
            const { searchParams } = new URL(req.url);
            const code = searchParams.get('code');
            if (!code) {
                console.error(
                    'No code url param from google found in the request',
                );
                return getHtmlResponse(
                    `<p>This callback isn't being used correctly, see logs.</p>`,
                );
            }
            const { tokens } = await oAuth2Client.getToken(code);
            await Bun.write(
                GOOGLE_CREDENTIALS_PATH,
                JSON.stringify(tokens, null, 2),
            );
            oAuth2Client.setCredentials(tokens);

            return getHtmlResponse(
                `<p>Saved token and logged in ✅</p><a href="/mail">Check Mail</a>`,
            );
        },

        '/runDbBackup': () =>
            backupDb().then(() => {
                return getHtmlResponse(`<p>Database backed up, see logs</p>`);
            }),

        '/mail': async () => getInboxContents(getGmailClient()),

        '/runChaseJob': async () => {
            logInfo('starting chase job: api kick');
            return runChaseJob();
        },

        '/sendMsg': async () =>
            sendMessageFromBot('Testing 123').then(() =>
                getHtmlResponse(`<p>Msg Sent ✅</p>`),
            ),
    },
});

logSuccess(`server running - ${HOST}/api/status`);

cron.schedule('*/5 * * * *', async () => {
    try {
        // logInfo('starting chase job: cron kick');
        // await runChaseJob();
    } catch (err) {
        logError('chase job', 'errored', err);
    }
});
