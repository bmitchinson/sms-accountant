import { test, expect } from 'bun:test';
import type { EMail, Transaction } from '../../src/types';
import { chaseEmailToTransaction } from '../../src/utils/chase';

const date = new Date();

test('chaseEmailToTransaction parses 00 cent charges correctly', () => {
    const expectedResult: Transaction = {
        id: 'green buggy',
        amount: 91.0,
        description: 'YMCA OF GREATER DES',
        datetime: date,
        source: 'Chase',
    };

    const input: EMail = {
        id: '1484934834',
        subject: 'Your $91.00 transaction with YMCA OF GREATER DES',
        body: '<p>tons of info and html here</p>',
        datetime: date,
    };

    expect(chaseEmailToTransaction(input)).toEqual(expectedResult);
});
