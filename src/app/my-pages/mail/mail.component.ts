import { Component, OnInit } from '@angular/core';
import { LedenItemExt } from '../../services/leden.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})

export class MailComponent extends BaseComponent implements OnInit {

  public itemsToMail: Array<LedenItemExt> = [];
  public EmailName: string = '';
  public EmailSubject: string = '';
  public SavedMails: string = '';
  public HtmlContent: string = '';
  public fileToUpload: File | null = null;

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.theBoundCallback = this.theCallback.bind(this);
  }

  public attachmentcontent: string = '';

  /***************************************************************************************************
  / De selectie is gewijzigd in het childcomponent.
  / Hier bepaal ik naar wie er een mail moet worden gestuurd.
  /***************************************************************************************************/
  onSelectionChanged($event) {
    this.itemsToMail = $event;
  }

  onHtmlContentChanged($event): void {
    this.HtmlContent = $event;
  }

  onEmailSubjectChanged($event): void {
    this.EmailSubject = $event;
  }

  onAttachmentFileChanged($event): void {
    this.fileToUpload = $event;
  }

  public theBoundCallback: Function;
  theCallback(lid: LedenItemExt) {}
}
