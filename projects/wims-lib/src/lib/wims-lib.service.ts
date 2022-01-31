import { Injectable, Optional } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WimsLibService {

  private config = undefined;

  constructor(@Optional() config?: Object) {
    if (config) {
      this.config = config['config'];
    }
  }

  get production():boolean {
    return this.config.production;
  }

  get baseurl(): string {
    return this.config.baseUrl;
  }

  get databaseName(): string {
    return this.config.databaseName;
  }

}

/***************************************************************************************************
/ Inspiratie voor de oplossing voor het doorgeven van de envrioment heb ik hier opgedaan.
/ De parameters zitten in module.ts in de forRoot. 
//* https://stackoverflow.com/questions/43529920/passing-environment-variables-to-angular-library
/***************************************************************************************************/
