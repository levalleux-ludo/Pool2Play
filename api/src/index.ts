import { ApiServer } from './server';
import { getMessage } from './message';
import { TestController } from './api.controllers/testController';
import { RootController } from './api.controllers/rootController';

const main = async () => {

    console.log(getMessage());

    const rootController = new RootController();
    const testController = new TestController();

    const server = new ApiServer([rootController, testController]);
    server.start();
}

main().catch(e => {
    console.error(e);
});
  