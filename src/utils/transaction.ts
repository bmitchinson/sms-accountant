export interface Transaction {
    id: string; // ex: two 5 letter words: green trust
    amount: number;
    description: string;
    originalDescription: string;
    datetime: Date;
    source: 'Chase' | 'Venmo' | 'LRoad' | 'Amazon';
}

export const makeTxtMsgContents = (transaction: Transaction) =>
    `
Transaction: ${transaction.id}
Amount: $${transaction.amount}
Description: ${transaction.description}
Date: ${transaction.datetime.toLocaleString()}
Source: ${transaction.source}
`.trim();
