import { Component, OnInit } from '@angular/core';
import { WimsLibService } from './wims-lib.service';

@Component({
  selector: 'lib-wims-lib',
  template: `
    <p>
      Hahaham This component inside "library1" library and reads the values from "environment.ts" file.
    </p>

    <h1>API URL : {{apiUrl}}</h1>`
})
export class WimsLibComponent implements OnInit {
  apiUrl = '';

  constructor(wimsLibService: WimsLibService) {
    this.apiUrl = wimsLibService.apiUrl;
  }

  ngOnInit(): void {
  }

}
