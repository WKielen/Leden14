import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { LedenItemExt, LedenService } from "src/app/services/leden.service";
import { ParamService } from "src/app/services/param.service";
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
  }

  onAskPermission() {
    function askNotificationPermission() {
      // function to actually ask the permissions
      function handlePermission(permission) {
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
        if(this.checkNotificationPromise()) {
          Notification.requestPermission()
          .then((permission) => {
            handlePermission(permission);
          })
        } else {
          Notification.requestPermission(function(permission) {
            handlePermission(permission);
          });
        }
      }
    }
    
  }

   checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch(e) {
      return false;
    }

    return true;
  }




  onClick() {
  }

}
