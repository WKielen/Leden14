import { Injectable, Optional } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WimsLibService {

  private _apiUrl = 'No value';

  constructor(@Optional() config?: Configurations) {
    if (config) {
      this._apiUrl = config.apiUrl;
    }
  }

  get apiUrl() {
    return this._apiUrl;
  }

}

/***************************************************************************************************
/ Inspiratie voor de oplossing voor het doorgeven van de envrioment heb ik hier opgedaan.
/ De parameters zitten in module.ts in de forRoot. 
//* https://stackoverflow.com/questions/43529920/passing-environment-variables-to-angular-library
/***************************************************************************************************/
export class Configurations {
  public apiUrl: string;

  constructor() {
    this.apiUrl = '';
  }

}