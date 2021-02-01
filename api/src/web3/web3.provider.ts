
import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import { config } from "../config";
import addressesJSON from '../../../contracts/contracts/addresses.json';
import { ContractInterface, ethers } from 'ethers';

const addresses_JSON = addressesJSON;
export interface INetwork {
    name: string;
    chainId: number;
    nodeUrl: string;
    wssUrl: string;
}

const NETWORKS = {
    // one: 'ganache',
    one: 'goerli',
    // two: 'ganache'
    // two: 'mumbai'
    two: 'bscTest'
}

function getBalanceAsNumber(
    bn: ethers.BigNumber,
    decimals: number,
    accuracy: number
  ): number {
    const r1 = ethers.BigNumber.from(10).pow(decimals - accuracy);
    const r2 = bn.div(r1);
    const r3 = r2.toNumber();
    const r4 = r3 / 10 ** accuracy;
    return r4;
  }

export class EthersWeb3Provider {
    private _provider: ethers.providers.JsonRpcProvider;
    private _wallet: ethers.Wallet;
  
    public constructor(network: INetwork) {
      this._provider = new ethers.providers.StaticJsonRpcProvider(
        {
          url: network.nodeUrl,
        },
        network
      );
  
      this._wallet = ethers.Wallet.fromMnemonic(
        process.env.MNEMONIC as string
      ).connect(this._provider);
      console.log('wallet', this._wallet.address, this._wallet.privateKey);
      this._wallet.getBalance().then((balance: ethers.BigNumber) => {
        console.log('current balance:', getBalanceAsNumber(balance, 18, 4));
      });
    }
  
    public async getNetwork(): Promise<{ name: string; chainId: number }> {
      return this._provider.getNetwork();
    }
  
    public async getCurrentAccount(): Promise<string> {
      return this._wallet.address;
    }

    public get signer(): ethers.Signer {
        return this._wallet;
    }
     
}


export class Web3Provider {
    private _web3: Web3;
    private _provider: HDWalletProvider;
    private _wssProvider: any;
    private _wssWeb3: Web3 | undefined;
    public constructor(private _network: INetwork) {
        this._provider = new HDWalletProvider({
          mnemonic: process.env.MNEMONIC as string,
          providerOrUrl: _network.nodeUrl,
        });
        this._web3 = new Web3(this._provider);
        if (_network.wssUrl) {
            this._wssProvider = new Web3.providers.WebsocketProvider(_network.wssUrl);
            this._wssWeb3 = new Web3(this._wssProvider);
        } else {
            this._wssProvider = undefined;
            this._wssWeb3 = undefined;
        }
    }
    public get network(): INetwork {
        return this._network;
    }
    public get web3(): Web3 {
        return this._web3;
    }
    public get provider(): any {
        return this._provider;
    }
    public get wssWeb3(): Web3 | undefined {
        return this._wssWeb3;
    }
    public get wssProvider(): any {
        return this._wssProvider;
    }
    public get account(): string {
        return this._provider.getAddress(0);
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

let addresses: any = {};
for (const id of ['one', 'two']) {
    const network = (NETWORKS as any)[id];
    console.log(id, 'build addresses for network', network);
    if (!(addresses as any)[id]) {
        (addresses as any)[id] = {};
    }
    for (const contract of Object.keys(addresses_JSON)) {
        const chainId = config().networks[network].chainId;
        (addresses as any)[id][contract] = (addresses_JSON as any)[contract][chainId];
    }
}

export const Web3Providers = web3Providers;

console.log('addresses', JSON.stringify(addresses));
export const Addresses = addresses;