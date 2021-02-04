import express, { query } from 'express';

export class TestController {
    private _router = express.Router();

    constructor() {
        this._router.get('/', this.get_test);
    }

    public get path() {
        return '/test'
    }

    public get router() {
        return this._router;
    }

    private get_test = (req: express.Request, res: express.Response) => {
        res.send({message: 'OK'});
    }
}