import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActionItem, ActionService, ACTIONSTATUS } from 'src/app/services/action.service';
import { AuthService } from 'src/app/services/auth.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { DuplicateKeyError } from 'src/app/shared/error-handling/duplicate-key-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import * as moment from 'moment';
import { ROLES } from 'src/app/services/website.service';

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.scss']
})
export class TodolistComponent extends ParentComponent implements OnInit {

  public amIBestuur: boolean = this.authService.isRole(ROLES.BESTUUR);
  private actionArray: Array<ActionItem> = null;

  constructor(private actionService: ActionService,
    public authService: AuthService,
    protected snackBar: MatSnackBar,
    public dialog: MatDialog) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.actionService.getAllActions$()
        .subscribe({
          next: (data) => {
            this.actionArray = data;
            this.updateComponenten();
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Update action komt uit component
  /***************************************************************************************************/
  updateAction($event) {
    if ($event.action == 'Add') {
      this.onAdd($event.data);
    }
    if ($event.action == 'Done') {
      if ($event.status == ACTIONSTATUS.REPEATING) {
        $event.data.StartDate = moment($event.data.StartDate).add(1, 'year').toDate().to_YYYY_MM_DD();
        $event.data.TargetDate = moment($event.data.TargetDate).add(1, 'year').toDate().to_YYYY_MM_DD();
      }
      this.onUpdate($event.data);
    }
    if ($event.action == 'Update') {
      this.onUpdate($event.data);
    }
    if ($event.action == 'Delete') {
      if ($event.status == ACTIONSTATUS.ARCHIVED || $event.status == ACTIONSTATUS.DECISION) {
        this.onDelete($event.data);
      } else {
        this.onUpdate($event.data);
      }
    }
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  private onAdd(actionItem: ActionItem) {
    this.registerSubscription(
      this.actionService.create$(actionItem)
        .subscribe({
          next: (data) => {

            actionItem.Id = data['Key'];
            this.actionArray.push(actionItem);
            this.updateComponenten();

            this.showSnackBar(SnackbarTexts.SuccessNewRecord);
          },
          error: (error: AppError) => {
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey);
            } else { throw error; }
          }
        }));
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  onUpdate(toBeUpdated: ActionItem): void {
    this.registerSubscription(
      this.actionService.update$(toBeUpdated)
        .subscribe({
          next: (data) => {

            let index = this.actionArray.findIndex(x => x === toBeUpdated.Id);
            this.actionArray[index] = toBeUpdated;
            this.updateComponenten();

            this.showSnackBar(SnackbarTexts.SuccessFulSaved);
          },
          error: (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
              this.showSnackBar(SnackbarTexts.NoChanges);
            } else { throw error; }
          }
        })
    );
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  onDelete(toBeDeleted: ActionItem): void {
    let sub = this.actionService.delete$(toBeDeleted.Id)
      .subscribe({
        next: (data) => {

          let index = this.actionArray.findIndex(x => x === toBeDeleted.Id);
          this.actionArray.splice(index, 1);
          this.updateComponenten();

          this.showSnackBar(SnackbarTexts.SuccessDelete);
        },
        error: (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound);
          } else { throw error; } // global error handler
        }
      })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Hier gooi ik de array in de stream die in de service is gedefinieerd
  / De componenten zijn geabboneerd op deze stream
  /***************************************************************************************************/
  updateComponenten(): void {
    this.actionService.actionStream.next(this.actionArray);
  }
}
