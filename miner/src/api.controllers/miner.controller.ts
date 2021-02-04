import { ATokenContract } from './../web3/aToken.contract';
import express, { query } from 'express';
import { Web3Providers } from '../web3/web3.provider';

export class MinerController {
    private _router = express.Router();

    constructor() {
        this._router.get('/balanceOf', this.balanceOf);
        this._router.get('/', this.get_);

    }

    public get path() {
        return '/miner'
    }

    public get router() {
        return this._router;
    }

    private balanceOf = (req: express.Request, res: express.Response) => {
        const contract = req.query.contract as string;
        if (!contract) {
            res.status(400).send('Please specify contract in query parameters');
            return;
        }
        const account = req.query.account as string;
        if (!account) {
            res.status(400).send('Please specify account in query parameters');
            return;
        }
        try {
            const web3Provider = Web3Providers.one;
            const aToken = new ATokenContract(contract, web3Provider);
            aToken.balanceOf(account).then((balance) => {
                res.send({balance: balance.toString()});
            }).catch(e => {
                throw e;
            });
        } catch(e) {
            res.status(400).send(e);
            return;
        }
    }
    private get_ = (req: express.Request, res: express.Response) => {
        res.send({Miner: 'OK'});
    }

}