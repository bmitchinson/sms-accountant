import { gmail_v1 } from 'googleapis';
import { getHtmlResponse } from '../utils/html';
import type { EMail } from '../types';
import type { GaxiosPromise } from '@googleapis/gmail';

const PROCESSED_LABEL_ID = 'Label_5739774446986961459';

const getHeaderOfEmail = (email: gmail_v1.Schema$Message) => {
    const headers = email?.payload?.headers || [];
    for (const header of headers) {
        if (header.name?.toLowerCase() === 'subject') {
            return header.value || '';
        }
    }
    throw new Error(`Unable to find header of email ${email.id}`);
};

const getEmailsFromSearchResult = async (
    gmailClient: gmail_v1.Gmail,
    searchResult: gmail_v1.Schema$ListMessagesResponse,
): Promise<EMail[]> => {
    const emailsToFetch = searchResult.messages || [];

    const fetchPromises = [] as GaxiosPromise<gmail_v1.Schema$Message>[];
    for (const emailToFetch of emailsToFetch) {
        emailToFetch.id &&
            fetchPromises.push(
                gmailClient.users.messages.get({
                    userId: 'me',
                    id: emailToFetch.id,
                }),
            );
    }

    return Promise.all(fetchPromises).then((emails) => {
        return emails.map(({ data }) => ({
            id: data.id || '',
            subject: getHeaderOfEmail(data),
            body: data?.payload?.body?.data
                ? Buffer.from(data.payload.body.data, 'base64url').toString(
                      'utf8',
                  )
                : '',
            datetime: new Date(Number(data.internalDate)),
        }));
    });
};

export const getAllUnprocessedChaseEmails = async (
    gmailClient: gmail_v1.Gmail,
): Promise<EMail[]> => {
    const searchResults = await gmailClient.users.messages.list({
        userId: 'me',
        maxResults: 500, // 500 is max
        q: 'from:no.reply.alerts@chase.com -label:processed "transaction was more than the $0.01 level you set."',
    });
    return await getEmailsFromSearchResult(gmailClient, searchResults.data);
};

export const getInboxContents = async (gmailClient: gmail_v1.Gmail) => {
    const searchResult = await gmailClient.users.messages.list({
        userId: 'me',
        maxResults: 100,
    });

    const emails = await getEmailsFromSearchResult(
        gmailClient,
        searchResult.data,
    );
    if (emails.length === 0) {
        return getHtmlResponse(`<h3>Messages: </h3><p>No emails found</p>`);
    }

    const htmlList = emails
        .map(
            (email) =>
                `<li>${email.subject}</li><p>${email.datetime}</p><a href="/mail/process?id=${email.id}">Mark email processed</a>`,
        )
        .join('');

    return getHtmlResponse(`<h3>Messages: </h3><ul>${htmlList}</ul>`);
};

export const markEmailAsProcessed = async (
    gmailClient: gmail_v1.Gmail,
    messageId: string,
) => {
    try {
        await gmailClient.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [PROCESSED_LABEL_ID],
            },
        });
        return getHtmlResponse(`<p>email labeled processed</p>`);
    } catch (error) {
        console.error(`Error starring email with ID ${messageId}:`, error);
        throw error;
    }
};
