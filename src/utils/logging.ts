// import { Logtail } from '@logtail/node';
// import { getEnv } from './config';

import chalk from 'chalk';

// const sourceToken = getEnv('SOURCE_TOKEN');
// const ingestingHost = getEnv('INGESTING_HOST');

const getTimeForLocalLogs = () =>
    `${new Date().toLocaleTimeString('en-US', { hour12: true })} -`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatObjectAsString = (object: any) => {
    const o = JSON.stringify(object, null, 2);
    return o === '{}' ? '' : ` ${o}`;
};

class FakeLogtail {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(msg: string) {
        console.error(getTimeForLocalLogs(), msg);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info(msg: string) {
        console.info(getTimeForLocalLogs(), msg);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    flush() {}
}

const logger = new FakeLogtail();
// sourceToken && ingestingHost
//     ? new Logtail(sourceToken, {
//           endpoint: `https://${ingestingHost}`,
//       })
//     : new FakeLogtail();

export const logSuccess = (msg: string, info = {}) => {
    logger.info(
        chalk.green(`✅ (success) ${msg}`) + formatObjectAsString(info),
    );
    logger.flush();
};

export const logInfo = (msg: string, info = {}) => {
    logger.info(chalk.blue(`ℹ️ (info)    ${msg}`) + formatObjectAsString(info));
    logger.flush();
};

export const logError = (where: string, what: string, error = {}) => {
    logger.error(
        chalk.red(`❌ (error)   ${where} - ${what}`) +
            formatObjectAsString(error),
    );
    logger.flush();
};
