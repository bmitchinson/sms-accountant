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

export const HOST = env.get('HOST').required().asString();

export const CREDENTIALS_PATH = env
    .get('CREDENTIALS_PATH')
    .required()
    .asString();

export const TWILIO_SID = env.get('TWILIO_SID').required().asString();

export const TWILIO_AUTH_TOKEN = env
    .get('TWILIO_AUTH_TOKEN')
    .required()
    .asString();

export const RECIPIENT_CELL_NUM = env
    .get('RECIPIENT_CELL_NUM')
    .required()
    .asString();

export const SENDER_TWILIO_NUM = env
    .get('SENDER_TWILIO_NUM')
    .required()
    .asString();
