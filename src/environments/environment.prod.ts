export const environment = {
  production: true,
  baseUrl: 'https://www.ttvn.nl/api',
  loginUrl: 'https://www.ttvn.nl/api/signin',
  databaseName: 'ttvn',

    // De mail url wijst naar mijn rasp pi. waar een python flask server draait. Deze handelt de mail requests af. Tevens notifications requests.
  mailUrl: 'http://84.104.233.194:5001',

  // de proxy url stuurt requests door naar de Rasp.Pi. Dit kan ook direct natuurlijk maar we gebruiken deze proxy om de https te ontwijken op de Pi
  // de service worker wil namelijk alleen via https en de pi heeft dit niet.
  proxyUrl: 'https://www.ttvn.nl/api/proxy/',


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
