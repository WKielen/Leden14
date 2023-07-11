import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { LedenItemExt } from 'src/app/services/leden.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConvertToReadableDate } from 'src/app/shared/modules/DateRoutines';
import { ParentComponent } from 'src/app/shared/parent.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'app-send-inventation-dialog',
  templateUrl: './send-inventation.dialog.html',
  styles: []
})
export class SendInventationDialogComponent extends ParentComponent implements OnInit {
  constructor(
    private clipboard: Clipboard,
    public dialogRef: MatDialogRef<SendInventationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    protected snackBar: MatSnackBar
  ) {
    super(snackBar);
  }

  public itemsToMail: Array<LedenItemExt> = [];

  public attachmentFile: File | null = null;
  public emailSubject: string = '';
  public htmlContent: string = '';

  public theBoundCallback: Function;

  ngOnInit(): void {
    this.htmlContent = "Beste %voornaam%, <br> <br>Hierbij de uitnodiging voor inschrijving op ";
    this.emailSubject = "Uitnodiging tot inschrijving voor " + this.data.data['EvenementNaam'];

    let eventData = this.data.data.EvenementNaam + "<br>";
    if (this.data.data.Datum !== '')
      eventData += "Datum: " + ConvertToReadableDate(this.data.data.Datum) + "<br>";

    if (this.data.data.Tijd !== '')
      eventData += "Tijd: " + this.data.data.Tijd + "<br>";

    if (this.data.data.Lokatie !== '')
      eventData += "Lokatie: " + this.data.data.Lokatie + "<br>";

    if (this.data.data.Toelichting !== '')
      eventData += "Toelichting: " + this.data.data.Toelichting + "<br>";

    if (this.data.data.Inschrijfgeld !== '0' && this.data.data.Inschrijfgeld !== '')
      eventData += "Inschrijfgeld: " + (Number(this.data.data.Inschrijfgeld)).AmountFormatHTML() + "<br>";

    this.htmlContent += '<br>' + eventData;
    this.htmlContent += '<br>' + '%link%';

    this.theBoundCallback = this.theCallback.bind(this);
  }

  /***************************************************************************************************
  / Sluit dialog
  /***************************************************************************************************/
  onSubmit(): void {
    this.dialogRef.close(this.data.data);
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

  onCreateLink() {
    let link: string = btoa(JSON.stringify({ 'evenement': this.data.data['Id'] }));
    let linkcontent = this.createLink(link);
    this.htmlContent = this.htmlContent + '<br>' + linkcontent;
    this.clipboard.copy(linkcontent);
    this.showSnackBar('link gekopieerd naar clipboard');
    
  }

  onCreateLinkHTML() {
    let link: string = btoa(JSON.stringify({ 'evenement': this.data.data['Id'] }));
    let linkcontent = this.createHTMLLink(link);
    this.htmlContent = this.htmlContent + '<br>' + linkcontent;
    this.clipboard.copy(linkcontent);
    this.showSnackBar('link gekopieerd naar clipboard');
  }

  theCallback(lid: LedenItemExt) {
    let link: string = btoa(JSON.stringify({ 'evenement': this.data.data['Id'], 'lidnr': lid.LidNr }));
    return this.createHTMLLink(link);
  }

  createLink(link: string): string {
    if (this.developmentMode)
      return "http://localhost:4200/#/inschrijven?evenement=" + link;
    else
      return "https://www.ttvn.nl/app/#/inschrijven?evenement=" + link;
  }

  createHTMLLink(link: string): string {
    if (this.developmentMode)
      return "<a href='" + "http://localhost:4200/#/inschrijven?evenement=" + link + "'>" + "Hier inschrijven voor " + this.data.data['EvenementNaam'] + "</a>";
    else
      return "<a href='" + "https://www.ttvn.nl/app/#/inschrijven?evenement=" + link + "'>" + "Hier inschrijven voor " + this.data.data['EvenementNaam'] + "</a>";
  }

}
