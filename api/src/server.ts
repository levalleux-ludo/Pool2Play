import { IController } from './api.controllers/icontroller';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config';

const API_PORT = config().API_PORT;

export class ApiServer {
    private _app: express.Express;

    public constructor(controllers: IController[]) {
        this._app = express();
        // options for cors middleware
        const options: cors.CorsOptions = {
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
            ],
            credentials: true,
            methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
            origin: true,
            preflightContinue: false,
        };
        this._app.use(cors(options));
        this._app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
        this._app.use(bodyParser.json()); // parse application/json
        this._app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    
        /**
         * Setting routes
         */
        for (const contr of controllers) {
            this._app.use(contr.path, contr.router);
        }

        this._app.options('*', cors(options) as any);
    }
    public get app() {
        return this._app;
    }

    public start(port?: number) {
        if (!port) {
            port = +API_PORT;
        }
        /**
         * START the server
         */
        this._app.listen(port, () => {
            console.log(`The server is running at port:${API_PORT}`);
        });
    }
}