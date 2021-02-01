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
      nodeUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
    },
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
