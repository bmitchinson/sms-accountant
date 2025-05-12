/* google setup before this file can be run
- cloud console
- apis + services > create credentials > oauth client id
  - application type: desktop app
- wait 5 min
- apis + services > library
  - search for gmail api + enable it
- apis + services > oauth consent screen > data access > add or remove scopes > "https://mail.google.com/" for complete gmail access
- apis + services > credentials > {name} > download json
  - This file contains secret info, do not commit it
  - GOOGLE_CLIENT_ID = json.installed.client_id
  - GOOGLE_CLIENT_SECRET = json.installed.client_secret
  - ^ set those in your .env file (see .env.example)  
- apis + services > oauth consent screen > audience > test users + Add users
  - Add the email that will sign into our app, to be allowed to have it's emails queried

now:
1. run this file "bun run auth_google"
2. visit the url it prints out
3. allow it access to your google account
4. it redirects you to a URL that doesn't exist. Check that url for "code" param
5. paste that code param into the terminal 
-- (that code can only be used once to generate credentials)
6. as a result "oauth_secret_token.json" is written to the root of the project
7. "oauth_secret_token.json" is what the app relies on, and must be mounted in the docker container
"""
Typically, Google refresh tokens remain valid for 6 months, 
are manually revoked, or the user’s password changes. 
A one-week gap in usage won’t invalidate a refresh token.
"""

*/

import { google } from 'googleapis';
import readline from 'readline';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './configuration';

const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost',
);

const SCOPES = ['https://mail.google.com/'];

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        }),
    );
}

async function saveAccessTokenToFile(oAuth2Client: any): Promise<void> {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log(
        'This utility script will generate an oauth token for you to mount to the core application.',
    );
    console.log(
        'Visiting this url and authorize your google account:\n',
        authUrl,
    );
    const code = await askQuestion(
        'Enter the code param from the redirect url here: ',
    );
    const { tokens } = await oAuth2Client.getToken(code);
    await Bun.write('oauth_secret_token.json', JSON.stringify(tokens, null, 2));
}

async function main() {
    await saveAccessTokenToFile(oAuth2Client);
    const tokenFile = Bun.file('./oauth_secret_token.json');
    const tokenText = await tokenFile.text();

    const token = JSON.parse(tokenText);
    oAuth2Client.setCredentials(token);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: '',
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
        console.log('No messages found.');
        return;
    }

    for (const msg of messages) {
        if (msg.id) {
            const msgRes = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });
            console.log('-------');
            console.log(`Email ID: ${msg.id}`);
            console.log(`Snippet: ${msgRes.data.snippet}`);
        }
    }
    console.log('-------');
    console.log('Done ✅ + token written to oauth_secret_token.json');
    console.log(
        'You can now run the app with the token mounted in the container',
    );
}

main().catch(console.error);
