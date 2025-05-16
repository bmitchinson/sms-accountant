import { Twilio } from 'twilio';
import {
    RECIPIENT_CELL_NUM,
    SENDER_TWILIO_NUM,
    TWILIO_AUTH_TOKEN,
    TWILIO_SID,
} from '../configuration';
import type { Transaction } from '../types';

export const sendTransactionText = async (transaction: Transaction) => {
    const client = new Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

    const message = `
Transaction: ${transaction.id}
Amount: $${transaction.amount}
Description: ${transaction.description}
Date: ${transaction.datetime.toLocaleString()}
Source: ${transaction.source}
`.trim();

    try {
        const result = await client.messages.create({
            body: message,
            from: SENDER_TWILIO_NUM,
            to: RECIPIENT_CELL_NUM,
        });

        return result;
    } catch (error) {
        console.error('Failed to send transaction text:', error);
        throw error;
    }
};
