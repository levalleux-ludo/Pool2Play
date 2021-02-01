import { AbiItem } from 'web3-utils';
import { Contract as EthContract } from 'web3-eth-contract';
import Web3 from 'web3';

export abstract class Web3Contract {
    protected contract: EthContract;
    constructor(
        address: string,
        abi: AbiItem[],
        protected web3: Web3,
        protected account?: string
    ) {
        this.contract = new web3.eth.Contract(abi, address);
    }
}