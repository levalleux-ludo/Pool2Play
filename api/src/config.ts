import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
const res = dotenvConfig({
    debug: false,
    path: resolve(__dirname, './../.env'),
});
if (res.error) {
    throw res.error;
}

if (!process.env.APP_ID) {
    throw new Error(`Variable 'APPID' is not defined in running environment`);
}

if (!process.env.API_PORT) {
    throw new Error(`Variable 'API_PORT' is not defined in running environment`);
}

export const config = (): any => {
    return {
        APP_ID: process.env.APP_ID,
        API_PORT: process.env.API_PORT
    };
}