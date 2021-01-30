import { MinerController } from './api.controllers/miner.controller';
import { ApiServer } from './server';
import { getMessage } from './message';
import { TestController } from './api.controllers/testController';
import { RootController } from './api.controllers/rootController';

const main = async () => {

    console.log(getMessage());

    const rootController = new RootController();
    const testController = new TestController();
    const minerController = new MinerController();

    const server = new ApiServer([rootController, testController, minerController]);
    server.start();
}

main().catch(e => {
    console.error(e);
});
  