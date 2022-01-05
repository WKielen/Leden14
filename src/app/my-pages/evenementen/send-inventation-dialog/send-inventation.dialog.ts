import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LedenItemExt } from 'src/app/services/leden.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConvertToReadableDate } from 'src/app/shared/modules/DateRoutines';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-send-inventation-dialog',
  templateUrl: './send-inventation.dialog.html',
  styles: []
})
export class SendInventationDialogComponent extends BaseComponent implements OnInit {
  constructor(
    private clipboard: Clipboard,
    public dialogRef: MatDialogRef<SendInventationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    super();
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
  }

  theCallback(lid: LedenItemExt) {
    let link: string = btoa(JSON.stringify({ 'evenement': this.data.data['Id'], 'lidnr': lid.LidNr }));
    return this.createLink(link);
  }

  createLink(link: string): string {
    if (this.developmentMode)
      return "<a href='" + "http://localhost:4200/#/inschrijven?evenement=" + link + "'>" + "Hier inschrijven voor " + this.data.data['EvenementNaam'] + "</a>"
    else
      return "<a href='" + "https://www.ttvn.nl/app/#/inschrijven?evenement=" + link + "'>" + "Hier inschrijven voor " + this.data.data['EvenementNaam'] + "</a>"
  }

}
