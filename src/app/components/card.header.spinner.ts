import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'mat-card-header-spinner',
  template: `
   <mat-card-header>
    <mat-card-title> {{ title }}</mat-card-title>
      <div style="flex: 1;"></div>
      <ng-container *ngTemplateOutlet="extraButtonsTemplate"></ng-container>
      <div fxFlex fxLayout="row" fxLayoutAlign="flex-end">
        <mat-spinner color="warn" mode="determinate" diameter="35" [value]="Value" strokeWidth="7">
        </mat-spinner>
      </div>
    </mat-card-header>
    <small class="development" *ngIf="developmentMode">{{ me }}</small>
`,
  styles: ['mat-spinner { margin-top: 3px; margin-right: 20px; }'
  ]
})

export class CardHeaderSpinnerComponent extends BaseComponent {
  @Input('progress') progress: number;
  @Input('title') title: string;
  @Input() extraButtonsTemplate!: TemplateRef<any>;

  get Value() {
    return (this.progress / 10) * 1.4;
  }
}
