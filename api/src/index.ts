import { TellorContract, TellorContractE } from './web3/tellor.contract';
import { MinerService } from './services/miner.service';
import { GameMasterContract } from './web3/gameMaster.contract';
import { SubscriptionCheckerContract } from './web3/subscriptionChecker.contract';
import { MinerController } from './api.controllers/miner.controller';
import { ApiServer } from './server';
import { getMessage } from './message';
import { TestController } from './api.controllers/testController';
import { RootController } from './api.controllers/rootController';
import { SubscriptionCheckerController } from './api.controllers/subscription.controller';
import { Web3Providers, Addresses, EthersWeb3Provider } from './web3/web3.provider';

const main = async () => {

    console.log(getMessage());

    const rootController = new RootController();
    const testController = new TestController();
    const minerController = new MinerController();
    const web3Provider = Web3Providers.two;
    const subscriptionCheckerContract = new SubscriptionCheckerContract(
        ((Addresses as any).two as any).subscriptionChecker,
        web3Provider,
        web3Provider.account
    );
    const gameMasterContract = new GameMasterContract(
        ((Addresses as any).two as any).gameMaster,
        web3Provider,
        web3Provider.account
    );
    const subscriptionCheckerController = new SubscriptionCheckerController(subscriptionCheckerContract, gameMasterContract);

    const ethersProvider = new EthersWeb3Provider(web3Provider.network);

    const tellorContract = new TellorContractE(
        ((Addresses as any).two as any).tellor,
        ethersProvider.signer
    )
    const minerService = new MinerService(tellorContract);

    const server = new ApiServer([rootController, testController, minerController, subscriptionCheckerController]);
    server.start();
}

main().catch(e => {
    console.error(e);
});
  