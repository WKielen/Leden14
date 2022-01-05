// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'https://www.ttvn.nl/api_test',
  loginUrl: 'https://www.ttvn.nl/api_test/signin',
  databaseName: 'ttest',

  // De mail url wijst naar mijn rasp pi. waar een python flask server draait. Deze handelt de mail requests af. Tevens notifications requests.
  mailUrl: 'http://84.104.233.194:5001',

  // de proxy url stuurt requests door naar de Rasp.Pi. Dit kan ook direct natuurlijk maar we gebruiken deze proxy om de https te ontwijken op de Pi
  // de service worker wil namelijk alleen via https en de pi heeft dit niet.
  proxyUrl: 'https://www.ttvn.nl/api_test/proxy/',

  firebase: {
    apiKey: "AIzaSyBrkqBOtSElrG76AIjsaHe9SrmZA_0gjrY",
    authDomain: "ttvn-app.firebaseapp.com",
    databaseURL: "https://ttvn-app-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ttvn-app",
    storageBucket: "ttvn-app.appspot.com",
    messagingSenderId: "953979335612",
    appId: "1:953979335612:web:7cdfc82b92decee36231b9",
    measurementId: "G-FKPQBQ8CTR"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
