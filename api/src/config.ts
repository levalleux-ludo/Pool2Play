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

if (!process.env.MNEMONIC) {
    throw new Error('Please set your MNEMONIC in a .env file');
}

if (!process.env.MATICVIGIL_API_KEY) {
    throw new Error('Please set your MATICVIGIL_API_KEY in a .env file');
}
  
if (!process.env.INFURA_API_KEY) {
    throw new Error('Please set your INFURA_API_KEY in a .env file');
}
  
export const config = (): any => {
    return {
        APP_ID: process.env.APP_ID,
        API_PORT: process.env.API_PORT,
        networks: {
            goerli: {
                chainId: 5,
                name: 'goerli',
                nodeUrl: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
                wssUrl: `wss://goerli.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
            },
            ganache: {
                chainId: 1337,
                name: 'local (Ganache)',
                nodeUrl: `http://127.0.0.1:7545`,
                wssUrl: 'ws://127.0.0.1:7545',
            },
            ganache_docker: {
                chainId: 1337,
                name: 'local (Ganache)',
                nodeUrl: `http://host.docker.internal:7545`,
                wssUrl: 'ws://host.docker.internal:7545',
            },
            matic: {
                chainId: 137,
                name: 'MATIC',
                // nodeUrl: 'https://rpc-mumbai.maticvigil.com',
                nodeUrl: `https://rpc-mainnet.maticvigil.com/v1/${process.env.MATICVIGIL_API_KEY}`,
                wssUrl: `wss://rpc-mainnet.maticvigil.com/ws/v1/${process.env.MATICVIGIL_API_KEY}`,
            },
            mumbai: {
                chainId: 80001,
                name: 'Mumbai',
                nodeUrl: 'https://rpc-mumbai.matic.today',
                // nodeUrl: `https://rpc-mumbai.maticvigil.com/v1/${process.env.MATICVIGIL_API_KEY}`,
                // wssUrl: `wss://rpc-mumbai.maticvigil.com/ws/v1/${process.env.MATICVIGIL_API_KEY}`,
                wssUrl: `wss://ws-mumbai.matic.today`,
            },
        },
    };
}