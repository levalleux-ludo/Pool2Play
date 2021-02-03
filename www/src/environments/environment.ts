// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
