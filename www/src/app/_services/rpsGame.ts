import { Subject, BehaviorSubject } from 'rxjs';
import Web3 from "web3";
import { BlockchainService } from "./blockchain.service";
import { Subscription, Web3SubscriberService } from "./web3-subscriber.service";
import rockPaperScissorsJSON from '../../../../contracts/artifacts/contracts/RockPaperScissors.sol/RockPaperScissors.json';


export enum eGameStatus {
  Initialized, Ready, Committed, RoundEnded
}

export enum eChoice {
  Rock,
  Paper,
  Scissors
}

export const GameStatus = Object.keys(eGameStatus).map(key => eGameStatus[key]).filter(value => typeof value === 'string') as string[];

export const Choices = Object.keys(eChoice).map(key => eChoice[key]).filter(value => typeof value === 'string') as string[];

export class RSPGame {
  contract: any;
  subscription: Subscription;
  address: string;
  choice: eChoice;
  random: string;

  statusChanged = new Subject<eGameStatus>();
  roundEnded = new Subject<any>();
  gameEnded = new Subject<any>();
  onRefresh = new Subject<void>();

  constructor(
    private web3: Web3,
    private blockchainService: BlockchainService,
    private subscriberService: Web3SubscriberService
    ) {
      this.getCommittedValues();
  }

  async connect(address: string) {
    this.contract = new this.web3.eth.Contract(rockPaperScissorsJSON.abi as any, address);
    this.address = address.toLowerCase();
    await this.subscriberService.addContract('RockPaperScissors', address.toLowerCase(), rockPaperScissorsJSON.abi);
    this.subscription = this.subscriberService.addSubscription(address.toLowerCase(), (event) => {
      console.log('RockPaperScissors: receive event', event);
      switch (event.name) {
        case 'onPlayerRegistered': {
          console.log('RockPaperScissors receive event onPlayerRegistered', JSON.stringify(event));
          this.onRefresh.next();
          break;
        }
        case 'onStatusChanged': {
          console.log('RockPaperScissors receive event onStatusChanged', JSON.stringify(event));
          const newStatus = parseInt(event.returnValues.newStatus.toString());
          this.statusChanged.next(newStatus);
          break;
        }
        case 'onRoundEnded': {
          console.log('RockPaperScissors receive event onRoundEnded', JSON.stringify(event));
          this.roundEnded.next({
            choices: event.returnValues.choices,
            winner: event.returnValues.winner,
            scores: event.returnValues.scores
          });
          break;
        }
        case 'onGameEnded': {
          console.log('RockPaperScissors receive event onGameEnded', JSON.stringify(event));
          this.gameEnded.next({
            scores: event.returnValues.scores
          });
          break;
        }
        default: {
          console.log('GameMaster: ignore event', event.name);
          break;
        }
      }
    });
    const status = await this.status();
    this.statusChanged.next(status);
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.contract = undefined;
    this.address = undefined;
  }

  getPlayers(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      const players = [];
      for(let i = 0; i < 2; i++) {
        const address = await this.contract.methods.players(i).call();
        if (address !== '0x' + '0'.repeat(40)) {
          const score = await this.contract.methods.scores(i).call();
          const committed = await this.contract.methods.committed(i).call();
          const revealed = await this.contract.methods.revealed(i).call();
          players.push({
            index: i,
            address: address.toLowerCase(),
            score,
            committed,
            revealed
          });
        }
      }
      resolve(players);
    });
  }

  status(): Promise<eGameStatus> {
    return new Promise<eGameStatus>((resolve, reject) => {
      this.contract.methods.status().call().then((status: string) => {
        resolve(eGameStatus[GameStatus[+status]]);
      }).catch(reject);
    });
  }

  nbRounds(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.contract.methods.nbRounds().call().then((nbRounds: string) => {
        resolve(parseInt(nbRounds));
      }).catch(reject);
    });
  }

  remainingRounds(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.contract.methods.remainingRounds().call().then((remainingRounds: string) => {
        resolve(parseInt(remainingRounds));
      }).catch(reject);
    });
  }

  commit(choice: eChoice): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const secret = this.getSecretChoice(choice);
      console.log('secret', secret);
      this.choice = choice;
      this.random = secret.random;
      this.saveCommittedValues();
      // this.myStatus.next(ePlayerStatus.Pending);
      this.contract.methods.commit(secret.secret).send({from: this.blockchainService.status.account})
      .once('receipt', receipt => {
        console.log(receipt);
      })
      .once('transactionHash', txHash => {
        console.log(txHash);
      })
      .once('confirmation', (nbConfirmaton, receipt) => {
        resolve();
      })
      .once('error', (error, receipt) => {
        console.error(error);
        console.error(receipt);
        reject(error);
      })
    });
  }
  reveal(): Promise<void> {
    if ((this.random === undefined) || (this.choice === undefined)) {
      throw new Error('Cannot reveal because no choice has been memorized');
    }
    return new Promise<void>(async (resolve, reject) => {
      this.contract.methods.reveal(this.choice, this.web3.utils.hexToBytes(this.random)).send({from: this.blockchainService.status.account})
      .once('receipt', receipt => {
        console.log(receipt);
      })
      .once('transactionHash', txHash => {
        console.log(txHash);
      })
      .once('confirmation', (nbConfirmaton, receipt) => {
        this.random = undefined;
        this.choice = undefined;
        this.saveCommittedValues();
        resolve();
      })
      .once('error', (error, receipt) => {
        console.error(error);
        console.error(receipt);
        reject(error);
      })
    });
  }

  getSecretChoice(choice: eChoice) {
    const rdm = Math.floor(Math.random() * 100000000).toString();
    const rdmHash = this.web3.utils.keccak256(rdm);
    const rdmHash_tab = this.web3.utils.hexToBytes(rdmHash);
    console.log('rdm', rdm, 'hash', rdmHash);
    const choiceStr = Choices[choice];
    const choiceHash = this.web3.utils.keccak256(choiceStr);
    const choiceHash_tab = this.web3.utils.hexToBytes(choiceHash);
    console.log('choice', choiceStr, 'hash', choiceHash);
    const xor_tab = [];
    for (let i = 0; i < 32; i++) {
        xor_tab.push(choiceHash_tab[i] ^ rdmHash_tab[i]);
    }
    const xor = this.web3.utils.bytesToHex(xor_tab);
    console.log('xor', xor);
    const secret = this.web3.utils.keccak256(xor)
    console.log('secret', secret);
    return { random: this.web3.utils.utf8ToHex(rdm), secret }
  }

  saveCommittedValues() {
    if (this.choice !== undefined) {
      localStorage.setItem('RPS_CHOICE', this.choice.toString());
    } else {
      localStorage.removeItem('RPS_CHOICE');
    }
    if (this.random !== undefined) {
      localStorage.setItem('RPS_RANDOM', this.random);
    } else {
      localStorage.removeItem('RPS_RANDOM');
    }
  }

  getCommittedValues() {
    if (localStorage.getItem('RPS_CHOICE') !== undefined) {
      this.choice = parseInt( localStorage.getItem('RPS_CHOICE'));
    }
    if (localStorage.getItem('RPS_RANDOM') !== undefined) {
      this.random = localStorage.getItem('RPS_RANDOM');
    }
  }

}
