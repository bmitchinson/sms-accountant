import { OAuth2Client } from 'google-auth-library';
import { gmail_v1 } from 'googleapis';
import { getHtmlResponse } from '../utils/html';

export const getInboxContents = async (oAuth2Client: OAuth2Client) => {
    const gmail = new gmail_v1.Gmail({ auth: oAuth2Client });
    const listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: '',
    });

    const messagesFound = listRes.data.messages || [];
    if (messagesFound.length === 0) {
        return getHtmlResponse(`<h3>Messages: </h3><p>No messages found</p>`);
    }

    const messagesDetails = [] as { id: string; snippet: string }[];
    for (const msg of messagesFound) {
        if (msg.id) {
            const msgRes = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });
            messagesDetails.push({
                id: msg.id,
                snippet: msgRes.data.snippet || '',
            });
        }
    }
    const htmlList = messagesDetails
        .map((m) => `<li>${m.snippet}</li>`)
        .join('');
    return getHtmlResponse(`<h3>Messages: </h3><ul>${htmlList}</ul>`);
};
