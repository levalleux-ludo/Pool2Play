import { Web3Provider } from './web3.provider';
import { AbiItem } from 'web3-utils';
import { Contract as EthContract } from 'web3-eth-contract';

export abstract class Web3Contract {
    protected contract: EthContract;
    constructor(
        address: string,
        abi: AbiItem[],
        protected web3Provider: Web3Provider,
        protected account?: string
    ) {
        this.contract = new web3Provider.web3.eth.Contract(abi, address);
    }
}