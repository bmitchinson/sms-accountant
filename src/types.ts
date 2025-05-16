export interface Transaction {
    id: string; // ex: two 5 letter words: green trust
    amount: number;
    description: string;
    datetime: Date;
    source: 'Chase' | 'Venmo' | 'LRoad' | 'Amazon';
}

export interface EMail {
    id: string;
    subject: string;
    body: string;
    datetime: Date;
}
