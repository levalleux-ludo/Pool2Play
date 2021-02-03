# Pool2Play

**Pool2Play** is a concept for decentralized game allowing to accept players only when they have staked to a subscription pool.

In decentralized games, there may be lots of transactions and paying fees can be really annoying for players and its an issue for on-boarding mass users.

The pool itself can be used with DeFi services to generate interests. The profits can be used to supply a GasRelay to pay the fees for in-game transactions.

However to realize this Pool2Play concept, we face the issue where the game's contracts and the pool contract are deployed on two different blockchains.

Using **Tellor** oracle platform with the proper improvements, we've managed to create the link between 2 different blockchains.

* We've used **Portis** in the front-end because it's a very convenient wallet to onboard new users (do not require Metamask, just an email) and it's able to switch seamlessly between 2 blockchains (with the same account).

* We've used **Tellor** (of course) with an extension of the oracle interface (ITellor.sol) to allow the request to be parameterized: in that way we're using a unique requestId to retrieve the balance of any account of any ERC20 contract of the targeted blockchain (the account and the token address are the parameters of the request).

* Finally we've deployed the game and the oracle on **Binance Smart Chain** (testnet) and the token to Ethereum Goerli to demonstrate the mechanism.

We've chosen the famous 'Rock Paper Scissors' game (with commit/reveal) to illustrate. The concept can, of course, be generalized to any kind of game.

## Video Presentation

[video](https://levalleux-ludo.github.io/DAPP/Pool2Play/video.html)

## Playable Demo

[demo](https://levalleux-ludo.github.io/DAPP/Pool2Play/demo.html)