import { Twilio } from 'twilio';
import {
    RECIPIENT_CELL_NUM,
    SENDER_TWILIO_NUM,
    TWILIO_AUTH_TOKEN,
    TWILIO_SID,
} from '../configuration';
import type { Transaction } from '../types';
import { sleep } from 'bun';
import { logError, logInfo, logSuccess } from './logging';

const client = new Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

const getTextMessage = (transaction: Transaction) =>
    `
Transaction: ${transaction.id}
Amount: $${transaction.amount}
Description: ${transaction.description}
Date: ${transaction.datetime.toLocaleString()}
Source: ${transaction.source}
`.trim();

export const sendTransactionText = async (transaction: Transaction) => {
    try {
        let message = await client.messages.create({
            body: getTextMessage(transaction),
            from: SENDER_TWILIO_NUM,
            to: RECIPIENT_CELL_NUM,
        });
        logInfo('twilio message posted');

        let msgChecksRemaining = 10;

        while (message.status !== 'delivered' && msgChecksRemaining >= 0) {
            if (message.status === 'failed' || message.errorCode) {
                logError('twilio text sender', `twilio text failed to send.`, {
                    status: message.status,
                    errorCode: message.errorCode,
                    errorMessage: message.errorMessage,
                });
                return false;
            }
            await sleep(500);
            message = await client.messages(message.sid).fetch();
            msgChecksRemaining--;
        }

        logSuccess('twilio message sent');
        return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        logError(
            'twilio client',
            'failed to submit text to twilio for sending -',
            error,
        );
        throw error;
    }
};
