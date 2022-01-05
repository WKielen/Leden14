import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-html-editor',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  <angular-editor [(ngModel)]="htmlInputContent" [config]="editorConfig" (ngModelChange)="onChange($event)"
                  [placeholder]="'Schrijf hier je tekst ...'"></angular-editor>
`
})

export class HtmlEditorComponent extends BaseComponent implements OnChanges {

  @Input()
  htmlInputContent = '';

  @Output()
  htmlOutputContent: EventEmitter<string> = new EventEmitter<string>();

  htmlContent: string = '';

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '20',
    maxHeight: 'auto',
    // width: '800px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo',
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',

      ],
    ]
  };

  /***************************************************************************************************
  / De input is vanuit de parent aangepast
  /***************************************************************************************************/
  ngOnChanges(changes: SimpleChanges): void {
    this.htmlContent = this.htmlInputContent;
  }

  /***************************************************************************************************
  / De tekst in de HTML box is aangepast
  /***************************************************************************************************/
  onChange($event): void {
    this.htmlOutputContent.emit($event);
  }
}
