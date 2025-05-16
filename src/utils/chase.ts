import type { EMail, Transaction } from '../types';

export const chaseEmailToTransaction = (email: EMail): Transaction => {
    const matcher = /Your \$(\d+\.\d{2}) transaction with (.+)/;
    const match = email.subject.match(matcher);

    if (!match) {
        throw new Error(
            `Could not parse Chase email subject: ${email.subject}\nid: ${email.id}`,
        );
    }

    return {
        id: 'green buggy', // todo: replace w 2 word generation
        // @ts-expect-error missing match is already checked above
        amount: parseFloat(match[1]),
        // @ts-expect-error missing match is already checked above
        description: match[2].trim(),
        datetime: email.datetime,
        source: 'Chase',
    };
};
