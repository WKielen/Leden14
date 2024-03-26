import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { NotFoundError } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { LedenItemExt, LedenService } from "src/app/services/leden.service";
import { NotificationService } from "src/app/services/notification.service";
import { ParamService } from "src/app/services/param.service";
import { AppError } from "src/app/shared/error-handling/app-error";
import { DuplicateKeyError } from "src/app/shared/error-handling/duplicate-key-error";
import { NoChangesMadeError } from "src/app/shared/error-handling/no-changes-made-error";
import { SnackbarTexts } from "src/app/shared/error-handling/SnackbarTexts";
import { ParentComponent } from "src/app/shared/parent.component";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent
  extends ParentComponent implements OnInit {

  constructor(
    protected snackBar: MatSnackBar,
    protected paramService: ParamService,
    protected ledenService: LedenService,
    protected authService: AuthService,
    protected notificationService: NotificationService,
  ) {
    super(snackBar);
  }

  public ledenLijst: Array<LedenItemExt> = [];

  ngOnInit() {
    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe({
          next: (data: Array<LedenItemExt>) => {
            this.ledenLijst = data;
          }
        }));

        // let date = new Date();
        // console.log('in UTC format(date.toUTCString)', date.toUTCString() );
        // console.log('in UTC format(date.toLocaleString)', date.toLocaleString() );
        // console.log('in UTC format(date.toDateString)', date.toDateString() );
        // console.log('in UTC format(date.toISOString', date.toISOString());
        // console.log(moment.utc('2012-12-14T00:29:40.276Z'));
        // console.log(moment.utc('2012-12-14T00:29:40.276Z').format());
        // console.log(moment.utc('2012-12-14T00:29:40.276Z').toDate());
        // var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        // var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        // console.log('in UTC format(date.toLocaleString)', (new Date).toLocaleString() );


        let now = new Date();
        console.log('tostring', now.toString());
        console.log('toISOstring', now.toISOString());
        console.log('JSON', now.toJSON());
        console.log('UTC', now.toUTCString());
        console.log('locale string', now.toLocaleString() );
        let nowmoment = moment();
        console.log('moment format',nowmoment.format("YYYY-MM-DDTHH:mm:ss.SSSZZ"));


        console.log("betere oplossing????", moment.utc(now).format("YYYY-MM-DDTHH:mm:ss") + moment().format("SSSZZ"));

        // betere oplossing




      }

  onClick() {
    let x = {
      "Agenda_Id": "67",
      "Naam": "Piet",
      "Email": "wim_kielen@hotmail.com"
    };


    this.registerSubscription(
      this.notificationService.notification$(x)
        .subscribe({
          next: (data) => {
            this.showSnackBar(SnackbarTexts.SuccessDelete);
          },
          error: (error: AppError) => {
            console.error(error);
            if (error instanceof NoChangesMadeError) {
              this.showSnackBar(SnackbarTexts.NoChanges);
            } else if (error instanceof NotFoundError) {
              this.showSnackBar(SnackbarTexts.NotFound);
            } else if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey);
            } else {
              throw error;
            }
          }
        })
    );

  }



  public onAskPermission(): void {
    function askNotificationPermission() {
      // function to actually ask the permissions
      function handlePermission(permission: any) {
        // set the button to shown or hidden, depending on what the user answers
        // if(Notification.permission === 'denied' || Notification.permission === 'default') {
        //   notificationBtn.style.display = 'block';
        // } else {
        //   notificationBtn.style.display = 'none';
        // }
      }

      // Let's check if the browser supports notifications
      if (!('Notification' in window)) {
        console.log("This browser does not support notifications.");
      } else {
        if (this.checkNotificationPromise()) {
          Notification.requestPermission()
            .then((permission) => {
              handlePermission(permission);
            })
        } else {
          Notification.requestPermission(function (permission) {
            handlePermission(permission);
          });
        }
      }
    }

  }

  public checkNotificationPromise(): boolean {
    try {
      Notification.requestPermission().then();
    } catch (e) {
      return false;
    }

    return true;
  }





}
