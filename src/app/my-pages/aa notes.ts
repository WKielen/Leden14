//TODO:
/**
 * * Important
 *  ! Deprecated do not use
 * TODO in orange
 * ? Op deze vraag heb ik geen antwoord
 *
 *
 * @param name
 * @param message
 * @param lid
 * @returns
 *
 *
 *
 * auto comment --> /**
 *
 *
 * snippet :  obs & sub
 *
 *
 *  json to interface CTRL-SHIFT-V
 *
 *
*/
/***************************************************************************************************
/ CRTL SHIFT B --> default build production
/***************************************************************************************************/

//// Dit is a strike through
/*

app toevoegen aan manifest.webmanifest en ngsw-config.json



*/

// Tabel kopieeren   CREATE TABLE new_table AS SELECT * FROM original_table;    






# run in production mode
ng build --prod
http-server -p 8080 -c-1 dist/leden

Omdat het path naar de service-worker altijd naar 'app' wijst. (Lokatie op productie) moet de 
ngsw-worker.js en ngsw.json naar de 'app' folder worden gekopieerd om de service worker te laten werken. 
 manifest.webmanifest "start_url": "/index.html",   /app toevoegen
  index.html  <base href="/">  moet /app/ zijn







# Leden

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.


### Generate component is anders omdat we een module material.modules.ts hebben
`ng g c naam  --module=../app.module`

### Prerequisites

What things you need to install the software and how to install them

install:
* NodeJs via nodejs.org
* Angular CLI  `npm install -g @angular/cli` 
* Typescript `npm install -g typescript`

```
Het project is alsvolgt gemaakt:

* ng new my-app --service-worker --routing

* npm install --save @angular/material @angular/cdk
* npm install --save @angular/animations

* npm install --save @ng-bootstrap/ng-bootstrap
* npm install --save @angular/flex-layout

* npm install --save @auth0/angular-jwt
* npm install --save moment

* npm install --save export-to-csv
* npm install --save angular-iban iban       from https://www.npmjs.com/package/angular-iban

* npm install web-push -g                    look at https://blog.angular-university.io/angular-push-notifications/
* npm install jqwidgets-scripts --save

```


## Progressive Web App

This app has PWA on board. Please allways checkout the service-worker config `ngsw-config.json` when you change the API url or fonts url's.

Run `http-server -p 8080 -c-1 dist/ttvn -o` for the production version with pwa

## Build for production

Run `ng build --prod --base-href=/app/` for the production build
Run `ng build --configuration production --base-href=/app/` for the production build

## Development server


Run `ng serve --base-href=/app/` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).





Na de update naar 11 kreeg ik diverse warnings:
Warning: A:\Angular11\src\app\my-pages\download\download.component.ts depends on 'export-to-csv'. CommonJS or AMD dependencies can cause optimization bailouts.

Dit betekent dat er in de componenten die ik gebruik, gebruik wordt gemaakt van CommonJS
Eigenlijk is dit niet goed.

De warning kan onderdrukt worden met:
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
              "allowedCommonJsDependencies": [
                 "xlsx",
                 "export-to-csv",
                 "highcharts"
              ],

Daarnaast moest ik 
import { map } from 'rxjs/internal/operators/map';
vervangen door  rxjs/internal/operators

Data.services.ts --> @Directive toegevoegd




Spacer:

.example-spacer {
  flex: 1 1 auto;
}


<mat-toolbar-row>
  <span>Second Line</span>
  <span class="example-spacer"></span>
  <mat-icon class="example-icon" aria-hidden="false" aria-label="Example user verified icon">verified_user</mat-icon>
</mat-toolbar-row>
