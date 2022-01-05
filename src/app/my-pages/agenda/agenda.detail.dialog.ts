import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgendaItem, DoelgroepValues, OrganisatieValues, TypeValues } from 'src/app/services/agenda.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { AgendaDialogComponent } from './agenda.dialog';
import { SendInventationDialogComponent } from '../evenementen/send-inventation-dialog/send-inventation.dialog';
import { EventSubscriptionsDialogComponent } from '../evenementen/event-subscriptions-dialog/event-subscribtions.dialog';
import { Router } from '@angular/router';
import { ROUTE } from 'src/app/services/website.service';

@Component({
  selector: 'app-agenda-detail-dialog',
  templateUrl: './agenda.detail.dialog.html',
  styleUrls: ["./agenda.detail.dialog.scss"],
})
export class AgendaDetailDialogComponent implements OnInit{
  constructor(
    public dialogRef: MatDialogRef<AgendaDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private router: Router
  ) {
  }
  public showButtons: boolean = this.data.data.Type != 'A' && this.data.data.Type != '';
  public organisatie: string = OrganisatieValues.GetLabel(this.data.data.Extra1);
  public doelGroep: string = DoelgroepValues.GetLabel(this.data.data.DoelGroep);
  public type: string = TypeValues.GetLabel(this.data.data.Type);
  public inschrijfGeld: string = Number(this.data.data.Inschrijfgeld).AmountFormat();
  public toelichting: string = this.data.data.Toelichting.replace(new RegExp('\n', 'g'), "<br>")
  public showExtraButtons: string = 'none';

// Think for yourself, or
// others will think for you
// without thinking of you

  ngOnInit() {
    if (['T', 'V', 'H'].indexOf(this.data.data.Type) == -1) {
      this.showExtraButtons = 'none';
    }
    else {
      this.showExtraButtons = 'block';
    }
  }

  onClickModify() {
    this.showDialog('Wijzigen');
  }

  onClickCopy() {
    this.showDialog('Toevoegen');
  }

  onClickDelete() {
    this.data.method = 'Verwijderen'
    this.dialogRef.close(this.data);
  }

  showDialog(actiontype: string) {
    const dialogRef = this.dialog.open(AgendaDialogComponent, {
      data: {
        method: actiontype,        // for display in the header of the pop-up
        data: this.data.data,
      },
    });

    dialogRef.afterClosed()
      .subscribe({
        next: (data: AgendaItem) => {
          if (data) {
            this.data.data = data;
            this.data.method = actiontype;
            this.dialogRef.close(this.data);
          }
          else {
            this.data.method = 'Cancel';
            this.dialogRef.close(this.data);
          }
        },
        error: (error: AppError) => {
            console.log("error", error);
        }
      })
  }

  onClickSendInvitation(): void {

    const dialogRef = this.dialog.open(SendInventationDialogComponent, {
      // autoFocus: false,
      // height: '90vh !important',
      // width: '400px !important',
      data: {
        data: this.data.data,
      },
    });
  }

  onClickEventSubscriptions(): void {
    const dialogRef = this.dialog.open(EventSubscriptionsDialogComponent, {
      panelClass: 'custom-dialog-container', width: '800px',
      data: {
        data: this.data.data,
      },
    });
  }
  onClickAddSubscription(): void {
    this.router.navigate([ROUTE.subscribeeventPageRoute], { queryParams: { evenement:'eyJldmVuZW1lbnQiOiIyMTQ2IiwibGlkbnIiOiIxMzc4In0='} });
    this.dialogRef.close();
  }
}
