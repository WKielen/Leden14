import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SingleMail, SingleMailDialogComponent } from 'src/app/my-pages/mail/singlemail.dialog';
import { AuthService } from 'src/app/services/auth.service';
import { LedenItem } from 'src/app/services/leden.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ACTIVATIONSTATUS, UserItem, UserService } from 'src/app/services/user.service';
import { IHoldableResponse } from 'src/app/shared/directives/holdable.directive';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { DuplicateKeyError } from 'src/app/shared/error-handling/duplicate-key-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import { ParentComponent } from 'src/app/shared/parent.component';
import { RegistrationDetailDialogComponent } from './registration.detail.dialog';
import { RegistrationDialogComponent } from './registration.dialog';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent extends ParentComponent implements OnInit {

  public theBoundCallback: Function;

  newRegistrationSpinner = 0;
  existingRegistrationSpinner = 0;
  headerToggleChecked: boolean = false;
  registerList: Dictionary = new Dictionary([]);
  columnsNewToDisplay: string[] = ['FirstName', 'LastName', 'Userid', 'Email', 'actions3'];
  columnsExistingToDisplay: string[] = ['FirstName', 'LastName', 'Userid', 'Email', 'actions2'];

  dataSourceNewRegistrations = new MatTableDataSource<UserItem>();
  dataSourceExistingRegistrations = new MatTableDataSource<UserItem>();

  constructor(private registerService: UserService,
    protected notificationService: NotificationService,
    protected authService: AuthService,
    protected snackBar: MatSnackBar,
    public dialog: MatDialog) {
    super(snackBar)
  }

  ngOnInit(): void {
    let sub = this.registerService.getAll$()
      .subscribe({
        next: (data: Array<UserItem>) => {
          data.forEach((item) => {
            this.registerList.add(item.Userid, item);
          });
          this.createFilters();
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
    this.registerSubscription(sub);
  }


  /***************************************************************************************************
  / Filters
  /***************************************************************************************************/
  createFilters(): void {
    this.dataSourceNewRegistrations.data = this.registerList.values;
    this.dataSourceNewRegistrations.filterPredicate = this.createRegisterFilter();

    this.dataSourceExistingRegistrations.data = this.registerList.values;
    this.dataSourceExistingRegistrations.filterPredicate = this.createRegisterFilter();

    this.refreshFilters();
  }

  refreshFilters(): void {
    this.dataSourceNewRegistrations.filter = JSON.stringify({ Activated: ACTIVATIONSTATUS.NEW });
    this.dataSourceExistingRegistrations.filter = JSON.stringify({ Activated: ACTIVATIONSTATUS.ACTIVATED });
  }


  /***************************************************************************************************
  / Callback from the timer buttons
  /***************************************************************************************************/
  triggerCallback: boolean = false;
  setCallBackParameters(index: number, dataSource: MatTableDataSource<UserItem>, func) {
    const registerItem = dataSource.filteredData[index];
    this.theBoundCallback = func.bind(this, registerItem);
  }

  /***************************************************************************************************
  / New Registrations
  /***************************************************************************************************/
  onAddRegistration() {
    const toBeAdded = new UserItem();
    toBeAdded.Activated = ACTIVATIONSTATUS.NEW;

    // let tmp;
    this.dialog.open(RegistrationDialogComponent, {
      width: '500px',
      data: { 'method': 'Toevoegen', 'data': toBeAdded },
      disableClose: true
    })
      .afterClosed()  // returns an observable
      .subscribe({
        next: result => {
          if (result) {  // in case of cancel the result will be false

            let sub = this.registerService.create$(result)
              .subscribe({
                next: (data) => {
                  this.registerList.add(result.Userid, result);
                  this.refreshFilters();
                  this.showSnackBar(SnackbarTexts.SuccessNewRecord);
                },
                error: (error: AppError) => {
                  if (error instanceof DuplicateKeyError) {
                    this.showSnackBar(SnackbarTexts.DuplicateKey);
                  } else { throw error; }
                }
              })
            this.registerSubscription(sub);
          }
        }
      });
  }

  onDoneNewRegistration($event: IHoldableResponse, index: number): void {
    console.log("RegistrationComponent --> onDoneNewRegistration --> $event", $event);
    this.newRegistrationSpinner = $event.HoldTime;  // openRegisterSpinner wordt gelezen door spinner

    if ($event.Status == 'start') {
      this.setCallBackParameters(index, this.dataSourceNewRegistrations, this.cbDoneNewRegistration)
    }
    if ($event.Status == 'early') {
      this.showSnackBar(SnackbarTexts.ReleasedToEarly);
    }
  }

  cbDoneNewRegistration($event): void {
    let toBeEdited: UserItem = this.registerList.get($event.Userid)
    toBeEdited.Activated = ACTIVATIONSTATUS.ACTIVATED;
    this.updateRegister(toBeEdited);
    this.onMail(toBeEdited);
  }

  onMail(toBEedited: UserItem): void {
    let lid = new LedenItem();
    lid.Achternaam = toBEedited.LastName;
    lid.Voornaam = toBEedited.FirstName
    lid.Email1 = toBEedited.Email;

    let data = new SingleMail();
    data.TemplatePathandName = 'templates/template_bevestiging_nieuwe_gebruiker.html';
    data.Subject = "Bevestiging gebruiker TTVN app";
    data.Lid = lid;
    this.dialog.open(SingleMailDialogComponent, {
      data: data,
      disableClose: true
    })
  }


  onEditNewRegistation(index: number): void {
    let toBeEdited: UserItem = this.dataSourceNewRegistrations.filteredData[index];
    this.updateRegistrationWithDialog(toBeEdited);
  }


  onDeleteNewRegistation($event: IHoldableResponse, index: number): void {
    this.newRegistrationSpinner = $event.HoldTime;
    if ($event.Status == 'start') {  // first time call
      this.setCallBackParameters(index, this.dataSourceNewRegistrations, this.cbDeleteNewRegistation);
    }
    if ($event.Status == 'early') {
      this.showSnackBar(SnackbarTexts.ReleasedToEarly);
    }

  }
  cbDeleteNewRegistation($event): void {
    // console.log('in call back', $event );
    let toBeEdited: UserItem = this.registerList.get($event.Userid)
    this.cbDeleteRegister(toBeEdited);
  }


  onDblclickNewRegistration($event, index: number): void {
    this.showDetailDialog(this.dataSourceNewRegistrations.filteredData[index]);
  }


  /***************************************************************************************************
  / Existing Registrations
  /***************************************************************************************************/
  onEditExistingRegistration(index: number): void {
    let toBeEdited: UserItem = this.dataSourceExistingRegistrations.filteredData[index];
    this.updateRegistrationWithDialog(toBeEdited);
  }

  onDeleteExistingRegistation($event: IHoldableResponse, index: number): void {
    this.existingRegistrationSpinner = $event.HoldTime;
    if ($event.Status == 'start') {  // first time call
      this.setCallBackParameters(index, this.dataSourceExistingRegistrations, this.cbDeleteRegister)
    }
    if ($event.Status == 'early') {
      this.showSnackBar(SnackbarTexts.ReleasedToEarly);
    }
  }

  onDblclickExistingRegistration($event, index: number): void {
    this.showDetailDialog(this.dataSourceExistingRegistrations.filteredData[index]);
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  updateRegister(toBeEdited: UserItem): void {
    let sub = this.registerService.update$(toBeEdited)
      .subscribe({
        next: (data) => {
          this.refreshFilters();
          this.showSnackBar(SnackbarTexts.SuccessFulSaved);
        },
        error: (error: AppError) => {
          if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges);
          } else { throw error; }
        }
      });
    this.registerSubscription(sub);
  }

  updateRegistrationWithDialog(toBeEdited: UserItem): void {
    this.dialog.open(RegistrationDialogComponent, {
      width: '500px',
      data: {
        method: "Wijzigen",
        data: toBeEdited,
      },
    })
      .afterClosed()
      .subscribe({
        next: result => {
          if (result)
            this.updateRegister(toBeEdited);
        }
      });
  }

  cbDeleteRegister(toBeDeleted): void {
    let sub = this.registerService.delete$(toBeDeleted.Userid)
      .subscribe({
        next: (data) => {
          this.registerList.remove(toBeDeleted.Userid);
          this.refreshFilters();
          this.showSnackBar(SnackbarTexts.SuccessDelete);
        },
        error: (error: AppError) => {
          console.log('error', error);
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound);
          } else { throw error; } // global error handler
        }
      });
    this.registerSubscription(sub);
  }

  showDetailDialog(item: UserItem): void {
    this.dialog.open(RegistrationDetailDialogComponent, {
      width: '500px',
      data: {
        data: item,
      },
    })
  }

  /***************************************************************************************************
  / This filter is created at initialize of the page.
  /***************************************************************************************************/
  private createRegisterFilter(): (data: UserItem, filter: string) => boolean {
    let filterFunction = function (data: UserItem, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      return (data.Activated == searchTerms.Activated);
    }
    return filterFunction;
  }
}
