
import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import { config } from "../config";

export interface INetwork {
    name: string;
    chainId: number;
    nodeUrl: string;
    wssUrl: string;
}

const NETWORKS = {
    one: 'ganache',
    // one: 'goerli',
    two: 'ganache'
    // two: 'mumbai'
}
  
export class Web3Provider {
    private _web3: Web3;
    private _provider: HDWalletProvider;
    private _wssProvider: any;
    private _wssWeb3: Web3;
    public constructor(private network: INetwork) {
        this._provider = new HDWalletProvider({
          mnemonic: process.env.MNEMONIC as string,
          providerOrUrl: network.nodeUrl,
        });
        this._web3 = new Web3(this._provider);
        this._wssProvider = new Web3.providers.WebsocketProvider(network.wssUrl);
        this._wssWeb3 = new Web3(this._wssProvider);
    }
    public get web3(): Web3 {
        return this._web3;
    }
    public get provider(): any {
        return this._provider;
    }
    public get wssWeb3(): Web3 {
        return this._wssWeb3;
    }
    public get wssProvider(): any {
        return this._wssProvider;
    }

}

let web3Providers: any = {};
for (const id of ['one', 'two']) {
    const network = (NETWORKS as any)[id];
    console.log(id, 'build web3Provider for network', network);
    if (!(web3Providers as any)[id]) {
        (web3Providers as any)[id] = new Web3Provider(config().networks[network]);
    }
}

export const Web3Providers = web3Providers;