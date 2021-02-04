import { GameMasterContract } from './../web3/gameMaster.contract';
import express, { query } from 'express';
import { IController } from './icontroller';
import { SubscriptionCheckerContract } from './../web3/subscriptionChecker.contract';
import BigNumber from 'bignumber.js';

export class SubscriptionCheckerController implements IController {
    private _router = express.Router();

    constructor(
        private subscriptionCheckerContract: SubscriptionCheckerContract,
        private gameMasterContract: GameMasterContract
    ) {
        this._router.get('/', this.get_);
        this._router.post('/threshold', this.post_threshold);
        this._router.get('/threshold', this.get_threshold);

    }

    public get path() {
        return '/subscription'
    }

    public get router() {
        return this._router;
    }

    private post_threshold = (req: express.Request, res: express.Response) => {
        const {threshold} = req.body;
        if (!threshold) {
            res.status(400).send('Please specify threshold in request body');
            return;
        }
        try {
            const threshold_bn = new BigNumber(threshold);
            this.gameMasterContract.setThreshold(threshold_bn).then(() => {
                res.send({threshold});
            }).catch(e => {
                res.status(400).send(e);
            })
        } catch (e) {
            res.status(400).send(e);
            return;
        }
    }

    private get_ = (req: express.Request, res: express.Response) => {
        res.send({Subscription: 'OK'});
    }

    private get_threshold = (req: express.Request, res: express.Response) => {
        this.subscriptionCheckerContract.threshold().then((threshold) => {
            res.send({threshold});
        }).catch(e => {
            res.status(400).send(e);
        })
    }

}