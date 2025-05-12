import 'dotenv/config';
import * as env from 'env-var';

export const GOOGLE_CLIENT_ID = env
    .get('GOOGLE_CLIENT_ID')
    .required()
    .asString();

export const GOOGLE_CLIENT_SECRET = env
    .get('GOOGLE_CLIENT_SECRET')
    .required()
    .asString();
