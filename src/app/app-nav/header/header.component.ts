import { Component, OnInit, Input, Output, EventEmitter, VERSION } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ConfigDialogComponent } from 'src/app/app-nav/headerconfigdialog/config.dialog';
import { NotificationDialogComponent } from 'src/app/app-nav/headernotificationdialog/notification.dialog';
import { LogonData } from 'src/app/shared/classes/LogonData';
import { A2hsSafariHow2 } from 'src/app/shared/components/a2hs-ios-safari-how2/a2hs-ios-safari-how2';
import { ROUTE } from 'src/app/services/website.service';

// Een stukje JS voor het ophalen van de applicatie versie uit package.json
declare var require: any;
const { version: appVersion } = require('../../../../package.json');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  logonData: LogonData = new LogonData;
  public version: string = appVersion +  '/' + VERSION.full;

  constructor(
    private router: Router,
    public authService: AuthService,
    public configDialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.logonData.IsLoggedOn = this.authService.isLoggedIn();
    this.logonData.Name = this.authService.firstname;
    this.logonData.UserId = this.authService.userId;
  }

  // Toggle de sidebar via de DOM.
  toggleSideBar() {
    this.toggleSideBarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

  onSignOff(): void {
    this.authService.logOff();
    this.router.navigate([ROUTE.loginPageRoute]);
    this.logonData.IsLoggedOn = false;
    this.logonData.ShouldDisplayMenu = false;
  }

  onConfig(): void {
    this.configDialog.open(ConfigDialogComponent, {
      // panelClass: 'custom-dialog-container', width: '800px',
      data: {}
    })
  }

  onNotification(): void {
    this.configDialog.open(NotificationDialogComponent, {
      panelClass: 'custom-dialog-container', width: '400px',
      data: {}
    })
  }

  // Op iOS kunnen we de app niet op het homescreen plaatsen dus laten we een andere popup zien.
  onIos(): void {
    this.configDialog.open(A2hsSafariHow2, {
      panelClass: 'custom-dialog-container',
      data: {}
    })
  }
}
