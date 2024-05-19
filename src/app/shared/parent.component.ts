import { Component } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BaseComponent } from './base.component';

@Component({
  template: '',
})
export class ParentComponent extends BaseComponent {
  public isMobile: boolean = false;
  constructor(
    protected snackBar: MatSnackBar,
  ) {
    super();
    let userAgent = navigator.userAgent.toLowerCase();
    this.isMobile = /mobile/.test(userAgent);
  }

  public showSnackBar(message: string, consolelog?: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
    });

    if (consolelog) {
      console.log(consolelog);
    }
  }

}
