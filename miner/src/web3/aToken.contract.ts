import { Web3Provider } from './web3.provider';
import { BigNumber } from "bignumber.js";
import { Web3Contract } from "./web3.contract";
import aTokenABI from '../../../contracts/artifacts/contracts/AToken.sol/AToken.json';

export class ATokenContract extends Web3Contract {
    public constructor(address: string, web3Provider: Web3Provider) {
        super(address, (aTokenABI as any).abi, web3Provider.web3);
    }
    public totalSupply(): Promise<BigNumber> {
        return this.contract.methods.totalSupply().call();
    }
    public name(): Promise<BigNumber> {
        return this.contract.methods.totalSupply().call();
    }
    public symbol(): Promise<BigNumber> {
        return this.contract.methods.totalSupply().call();
    }
    public decimals(): Promise<BigNumber> {
        return this.contract.methods.totalSupply().call();
    }
    public balanceOf(account: string): Promise<BigNumber> {
        return this.contract.methods.balanceOf(account).call();
    }
}