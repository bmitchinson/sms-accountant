import { OAuth2Client } from 'google-auth-library';
import { gmail_v1 } from 'googleapis';
import { getHtmlResponse } from '../utils/html';

const PROCESSED_LABEL_ID = 'Label_5739774446986961459';

export const getInboxContents = async (oAuth2Client: OAuth2Client) => {
    const gmail = new gmail_v1.Gmail({ auth: oAuth2Client });
    const listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        // Exclude matches from your search criteria with a hyphen --> "-"
        q: 'from:no.reply.alerts@chase.com -label:processed', // Filter for emails from Chase that haven't been processed
    });

    const messagesFound = listRes.data.messages || [];
    if (messagesFound.length === 0) {
        return getHtmlResponse(`<h3>Messages: </h3><p>No messages found</p>`);
    }

    const messagesDetails = [] as { id: string; subject: string }[];
    for (const msg of messagesFound) {
        if (msg.id) {
            const msgRes = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });

            // Extract the subject from the headers
            let subject = '';
            const headers = msgRes.data.payload?.headers || [];
            for (const header of headers) {
                if (header.name?.toLowerCase() === 'subject') {
                    subject = header.value || '';
                    break;
                }
            }

            messagesDetails.push({
                id: msg.id,
                subject: subject,
            });
        }
    }
    const htmlList = messagesDetails
        .map(
            (m) =>
                `<li>${m.subject}</li><a href="/mail/process?id=${m.id}">Mark message processed</a>`,
        )
        .join('');
    return getHtmlResponse(`<h3>Messages: </h3><ul>${htmlList}</ul>`);
};

export const markEmailAsProcessed = async (
    oAuth2Client: OAuth2Client,
    messageId: string,
) => {
    const gmail = new gmail_v1.Gmail({ auth: oAuth2Client });

    try {
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [PROCESSED_LABEL_ID],
            },
        });
        console.log(
            `Email with ID ${messageId} successfully marked as processed`,
        );
        return getHtmlResponse(`<p>email labeled processed</p>`);
    } catch (error) {
        console.error(`Error starring email with ID ${messageId}:`, error);
        throw error;
    }
};
