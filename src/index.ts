import { OAuth2Client } from 'google-auth-library';

import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    HOST,
    CREDENTIALS_PATH,
} from './configuration';
import { getHtmlResponse } from './utils/html';
import chalk from 'chalk';
import { getInboxContents, markEmailAsProcessed } from './gmail/gmail';

const oAuth2Client = new OAuth2Client(
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

Bun.serve({
    development: true, // i want the error log always
    routes: {
        '/api/status': new Response('OK'),

        '/auth/signin': async (req) => {
            const tokenFile = Bun.file(CREDENTIALS_PATH);
            const { searchParams } = new URL(req.url);
            const reset = searchParams.get('reset');
            if ((await tokenFile.exists()) && !reset) {
                const tokenText = await tokenFile.text();
                const token = JSON.parse(tokenText);
                oAuth2Client.setCredentials(token);
                return getHtmlResponse(
                    `<p>You're already signed in ✅</p><a href="/mail">Check Mail</a>`,
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
            await Bun.write(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));
            oAuth2Client.setCredentials(tokens);

            return getHtmlResponse(
                `<p>Saved token and logged in ✅</p><a href="/mail">Check Mail</a>`,
            );
        },

        '/mail': async () => getInboxContents(oAuth2Client),

        '/mail/process': async (req) => {
            const { searchParams } = new URL(req.url);
            const id = searchParams.get('id');
            if (!id) {
                return new Response(
                    'Missing id parameter of email to mark processed',
                    {
                        status: 400,
                    },
                );
            }
            return await markEmailAsProcessed(oAuth2Client, id);
        },
    },
});

console.log(chalk.green(`Server running - ${HOST}/api/status`));
