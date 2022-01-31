import { Component, OnInit } from '@angular/core';
import { WimsLibService } from './wims-lib.service';

@Component({
  selector: 'lib-wims-lib',
  template: `
    <h1>V1 API URL : {{ apiUrl }}</h1>`
})
export class WimsLibComponent implements OnInit {
  apiUrl = '';

  constructor(wimsLibService: WimsLibService) {
    this.apiUrl = wimsLibService.baseurl;
  }

  ngOnInit(): void {
  }

}
