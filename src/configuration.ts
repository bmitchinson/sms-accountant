import 'dotenv/config';
import * as env from 'env-var';

export const HOST = env.get('HOST').required().asString();
export const DB_PATH = env.get('DB_PATH').required().asString();

export const GOOGLE_CLIENT_SECRET = env
    .get('GOOGLE_CLIENT_SECRET')
    .required()
    .asString();

export const GOOGLE_CLIENT_ID = env
    .get('GOOGLE_CLIENT_ID')
    .required()
    .asString();

export const GOOGLE_CREDENTIALS_PATH = env
    .get('GOOGLE_CREDENTIALS_PATH')
    .required()
    .asString();

export const TELEGRAM_APP_ID = env.get('TELEGRAM_APP_ID').required().asInt();

export const TELEGRAM_APP_HASH = env
    .get('TELEGRAM_APP_HASH')
    .required()
    .asString();

export const TELEGRAM_BOT_TOKEN = env
    .get('TELEGRAM_BOT_TOKEN')
    .required()
    .asString();

export const TELEGRAM_RECIPIENT_ID = env
    .get('TELEGRAM_RECIPIENT_ID')
    .required()
    .asInt();
