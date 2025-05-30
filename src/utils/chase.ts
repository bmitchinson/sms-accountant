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
    const matcher = /Your \$(\d+\.\d{2}) transaction with (.+)/;
    const match = email.subject.match(matcher);

    if (!match) {
        throw new Error(
            `Could not parse Chase email subject: ${email.subject}\nid: ${email.id}`,
        );
    }

    return {
        id: 'green buggy', // todo: replace w 2 word generation, do this at db level
        // @ts-expect-error missing match is already checked above
        amount: parseFloat(match[1]),
        // @ts-expect-error missing match is already checked above
        description: '',
        originalDescription: match[2].trim(),
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
                    logSuccess(`sent telegram msg for "${transaction.id}"`);
                    return markEmailAsProcessed(getGmailClient(), email.id);
                })
                .then(() => {
                    logSuccess(`marked the email as process`);
                }),
        ),
    );

    // const emailsToMarkAsSuccessfullyProcessed: EMail[] = [];
    // const emailsFailedToMarkAsProcessed: EMail[] = [];
    // textSendResults.forEach(({ textSent, email }) => {
    //     textSent && emailsToMarkAsSuccessfullyProcessed.push(email);
    //     !textSent && emailsFailedToMarkAsProcessed.push(email);
    // });

    // await Promise.all(
    //     emailsToMarkAsSuccessfullyProcessed.map((email) =>
    //         markEmailAsProcessed(getGmailClient(), email.id),
    //     ),
    // ).then(
    //     (r) =>
    //         r.length > 0 &&
    //         logSuccess(`${r.length} emails marked as processed`),
    // );

    // emailsFailedToMarkAsProcessed.length > 0 &&
    //     logError(
    //         'Chase Job',
    //         `${emailsFailedToMarkAsProcessed.length} emails not marked as processed due to failure`,
    //     );

    return getHtmlResponse(`<p>Chase Job complete. see logs for details</p>`);
};
