import { GMAIL_LABEL_NAME_TO_INDICATE_EMAIL_PROCESSED } from '../configuration';
import {
    getAllUnprocessedChaseEmails,
    getGmailClient,
    markEmailAsProcessed,
} from '../gmail/gmail';
import type { EMail, Transaction } from '../types';
import { getHtmlResponse } from './html';
import { logInfo, logSuccess } from './logging';
import { sendMessageFromBot } from './telegram';
import { makeTxtMsgContents } from './transaction';

export const chaseEmailToTransaction = (email: EMail): Transaction => {
    // email.subject = "Your $1,227.15 transaction with COUNTRY AUTOMOTIVE I"
    const match = email.subject.match(/Your \$(.+?) transaction with (.+)/);
    const price = match[1]; // "9.61"
    const descriptionFromChase = match[2]; // "AMAZON MKTPLACE PMTS"

    if (!match) {
        throw new Error(
            `Could not parse Chase email subject: ${email.subject}\nid: ${email.id}`,
        );
    }

    return {
        id: 'green buggy', // todo: replace w 2 word generation, do this at db level
        // @ts-expect-error missing match is already checked above
        amount: parseFloat(price),
        // @ts-expect-error missing match is already checked above
        description: '',
        originalDescription: descriptionFromChase.trim(),
        datetime: email.datetime,
        source: 'Chase',
    };
};

export const runChaseJob = async () => {
    const chaseItemsToProcess = await getAllUnprocessedChaseEmails(
        getGmailClient(),
    ).then((emails) =>
        emails.map((email) => ({
            email,
            transaction: chaseEmailToTransaction(email),
        })),
    );

    if (chaseItemsToProcess.length == 0) {
        logInfo('job ending early - no messages to process');
        return getHtmlResponse(
            `<p>Job ending early - no messages to process</p>`,
        );
    }

    await Promise.all(
        chaseItemsToProcess.map(({ transaction, email }) =>
            sendMessageFromBot(makeTxtMsgContents(transaction))
                .then(() => {
                    logSuccess(
                        `sent telegram msg for "${transaction.id}" - "${transaction.originalDescription}"`,
                    );
                    return markEmailAsProcessed(getGmailClient(), email.id);
                })
                .then(() => {
                    logSuccess(
                        `marked the email as processed (label: ${GMAIL_LABEL_NAME_TO_INDICATE_EMAIL_PROCESSED})`,
                    );
                }),
        ),
    );

    return getHtmlResponse(`<p>Chase Job complete. see logs for details</p>`);
};
