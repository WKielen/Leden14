import { Component, Input } from '@angular/core';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'mat-dialog-message-box',
  template: `
  <mat-card-content *ngIf="message">
    <small class="development" *ngIf="developmentMode">{{ me }}</small>
    <div class="internalcard"  [style.backgroundColor]="error ? '#ff6666':'#85e085'" >
      <div class="internalcardcontent">
          {{ message }}
      </div>
  </div>
</mat-card-content>
  `,
  styles: [
    `.internalcard {border: 1px solid rgba(0, 0, 0, 0.03); box-shadow: 2px 5px 5px lightgrey;
              margin: 15px; border-radius: 5px;}`,
    '.internalcardcontent { margin: 10px 10px 10px 20px;}'
  ],
})

export class DialogMessageBoxComponent extends BaseComponent {

  @Input() message: string = '';
  @Input() error: boolean = true;

}
