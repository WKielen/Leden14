import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LedenItemExt } from 'src/app/services/leden.service';
import { ParentComponent } from 'src/app/shared/parent.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-mail-kennismaker-dialog',
  templateUrl: './mail-kennismaker.dialog.html',
  styles: []
})
export class MailKennismakerDialogComponent extends ParentComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MailKennismakerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    protected snackBar: MatSnackBar
  ) {
    super(snackBar);
  }

  public columns: Array<string> = ['Naam'];
  public itemsToMail: Array<LedenItemExt> = [];

  public attachmentFile: File | null = null;
  public emailSubject: string = '';
  public htmlContent: string = '';
  public dataSource = new MatTableDataSource<LedenItemExt>();

  public theBoundCallback: Function;

  ngOnInit(): void {
    this.htmlContent = "Beste kennismaker, <br> <br>Hier de tekst";

    this.theBoundCallback = this.theCallback.bind(this);

    this.dataSource.data = this.data.data;

  }

  onMemberChecked($event) {
    this.itemsToMail = [];
    this.dataSource.data.forEach(element => {
      if (element['Checked'] == true) {
        this.itemsToMail.push(element);
      }
    });
  }

  /***************************************************************************************************
  / Sluit dialog
  /***************************************************************************************************/
  onSubmit(): void {
    this.dialogRef.close();
  }

  onSelectionChanged($event) {
    this.itemsToMail = $event;
  }

  onHtmlContentChanged($event) {
    this.htmlContent = $event;
  }
  onEmailSubjectChanged($event) {
    this.emailSubject = $event;
  }

  onAttachmentFileChanged($event) {
    this.attachmentFile = $event;
  }

  theCallback(lid: LedenItemExt) {
  }

}
