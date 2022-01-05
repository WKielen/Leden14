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
  // @Input('toggleChecked') checked: boolean = true;
  // @Input('toggleTitle') toggleTitle: string;
  // @Output('onSliderChanged') slided = new EventEmitter();

  // @Input('title2') title2: string;
  // @Input('toggleChecked2') checked2: boolean = true;
  // @Input('toggleTitle2') toggleTitle2: string;
  // @Output('onSliderChanged2') slided2 = new EventEmitter();
  @Input() extraButtonsTemplate: TemplateRef<any>;

  get Value() {
    return (this.progress / 10) * 1.4;
  }

  // onToggleClicked($event) {
  //   this.slided.emit($event);
  // }
  // onToggleClicked2($event) {
  //   this.slided2.emit($event);
  // }
}
