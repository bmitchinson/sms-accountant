import { gmail_v1 } from 'googleapis';
import { getHtmlResponse } from '../utils/html';
import type { EMail } from '../types';
import type { GaxiosPromise } from '@googleapis/gmail';
import { oAuth2Client } from '..';
import { logInfo } from '../utils/logging';
import { GMAIL_LABEL_NAME_TO_INDICATE_EMAIL_PROCESSED } from '../configuration';

let _gmailClient: null | gmail_v1.Gmail;

export const getGmailClient = () => {
    if (!_gmailClient) {
        _gmailClient = new gmail_v1.Gmail({ auth: oAuth2Client });
        logInfo('gmail client initialized');
    }
    return _gmailClient;
};

let _labelIdOfProcessedEmails: null | string;

export const getLabelIdOfProcessedEmails = async () => {
    if (!_labelIdOfProcessedEmails) {
        _labelIdOfProcessedEmails = getGmailClient()
            .users.labels.list({
                userId: 'me',
            })
            .then(
                ({ data }) =>
                    data.labels?.find(
                        (label) =>
                            label.name ===
                            GMAIL_LABEL_NAME_TO_INDICATE_EMAIL_PROCESSED,
                    )?.id,
            );
    }
    return _labelIdOfProcessedEmails;
};

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
        q: `from:no.reply.alerts@chase.com -label:${GMAIL_LABEL_NAME_TO_INDICATE_EMAIL_PROCESSED} "transaction was more than the $0.01 level you set."`,
    });
    return await getEmailsFromSearchResult(gmailClient, searchResults.data);
};

// this is just used to debug some auth stuff, not part of any routine processing
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
        const labelsResponse = await gmailClient.users.labels.list({
            userId: 'me',
        });

        const processedLabel = labelsResponse.data.labels?.find(
            (label) => label.name === 'processed',
        );

        if (!processedLabel?.id) {
            throw new Error('Could not find "processed" label');
        }

        return gmailClient.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [await getLabelIdOfProcessedEmails()],
            },
        });
    } catch (error) {
        console.error(
            `Error marking email as processed with ID ${messageId}:`,
            error,
        );
        throw error;
    }
};
