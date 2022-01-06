import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-mat-dialog-header-detail',
  template: `
  <h2 mat-dialog-title>
    <mat-toolbar class="task-header">
      <span> {{ title }}</span>
      <span style="flex: 1 1 auto !important;"></span>

      <button *ngIf="showButtons" mat-icon-button matTooltipClass="tooltip"
        matTooltip="Edit"color="white" (click)="onClickModify($event)">
        <mat-icon>edit</mat-icon>
      </button>
      <button *ngIf="showButtons" mat-icon-button matTooltipClass="tooltip"
          matTooltip="Copy"color="white" (click)="onClickCopy($event)">
        <mat-icon>content_copy</mat-icon>
      </button>
      <button *ngIf="showButtons" mat-icon-button matTooltipClass="tooltip"
          matTooltip="Verwijder"color="warn" (click)="onClickDelete($event)">
        <mat-icon>delete</mat-icon>
      </button>
      <ng-container *ngTemplateOutlet="extraButtonsTemplate"></ng-container>
      <button mat-icon-button color="white" matTooltipClass="tooltip"
        matTooltip="Sluit" cdkFocusInitial mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </mat-toolbar>
  </h2>

  <small class="development" *ngIf="developmentMode">{{ me }}</small>
  `,
  styles: [
    'h2 { margin: 0px; }',
    `.task-header {
      background-color: transparent;
      color: white;
      padding: 0;
      height: 25px;
    }`,
  ]
})

export class DialogHeaderComponent extends BaseComponent {

  @Input() title: string;
  @Input() showButtons: boolean = false;
  @Input() extraButtonsTemplate!: TemplateRef<any>;

  @Output('onClickModify') modify = new EventEmitter();
  @Output('onClickCopy') createcopy = new EventEmitter();
  @Output('onClickDelete') delete = new EventEmitter();

  onClickModify($event) {
    this.modify.emit($event);
  }
  onClickCopy($event) {
    this.createcopy.emit($event);
  }
  onClickDelete($event) {
    this.delete.emit($event);
  }
}
