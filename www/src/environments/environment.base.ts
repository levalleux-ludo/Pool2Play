export const environment = {
  production: false,
  other_networks: {
    ganache: {
      chainId: 1337,
      nodeUrl: 'http://localhost:7545'
    },
    bscTest: {
      chainId: 97,
      nodeUrl: 'https://data-seed-prebsc-2-s2.binance.org:8545'
    },
  },
  images: {
    ganache: 'assets/ganache.png',
    bscTest: 'assets/bsc.jpg',
    maticMumbai: 'assets/matic.png',
    portis: 'assets/portis.png',
    goerli: 'assets/ethereum.png',
    tellor: 'assets/tellor.png'
  },
  nativeSymbol: {
    ganache: 'assets/ganache.png',
    bscTest: 'BNB',
    maticMumbai: 'MATIC',
    goerli: 'GOETH',
  }
};
