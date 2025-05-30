import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import {
    TELEGRAM_APP_HASH,
    TELEGRAM_APP_ID,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_RECIPIENT_ID,
} from '../configuration';
import { logInfo, logSuccess } from './logging';
// import { NewMessage } from 'telegram/events';

const telegramClient = new TelegramClient(
    // if telegram auth rate limits me i should use a session instead
    // https://gram.js.org/getting-started/authorization#string-session
    new StringSession(''),
    TELEGRAM_APP_ID, // replace w env
    TELEGRAM_APP_HASH, // replace w env
    { connectionRetries: 5 },
);

// https://gram.js.org/faq#how-do-i-stop-logging
telegramClient.setLogLevel('warn');

telegramClient
    .start({
        botAuthToken: TELEGRAM_BOT_TOKEN,
    })
    .then(() => {
        logInfo('telegram client started');
        // Used to determine sender ID
        // telegramClient.addEventHandler(
        //     (evt) => console.log(evt.message.senderId?.valueOf()),
        //     new NewMessage({}),
        // );
    });

// note: this doesn't handle message failure well, need an error handler on the client?
export const sendMessageFromBot = async (msg: string) => {
    telegramClient.sendMessage(TELEGRAM_RECIPIENT_ID, {
        message: msg,
    });
};
