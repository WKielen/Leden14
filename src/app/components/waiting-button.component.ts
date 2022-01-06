/**
Use as:
  <mat-waiting-button icon="done" color="warn" (holdTime)="onDoneNewRegistration($event, i)" [myCallback]="theBoundCallback"></mat-waiting-button>

  Dit component renders een Material icon button. je moet deze button een seconde vasthouden voordat hij een event gooit.
  Het component geeft steeds het aantal miliseconden terug zodat de caller er iets mee kan doen.
  Na een seconde wordt via een callback een functie bij de caller aangeroepen.
  De seconde wordt berekent binnen de holdable directive
  */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { IHoldableResponse } from '../shared/directives/holdable.directive';

@Component({
  selector: 'mat-waiting-button',
  template: `<button mat-icon-button [color]="color" holdable (holdTime)="onHoldTimeChanged($event)">
              <mat-icon>{{icon}}</mat-icon>
             </button>
            `
})
export class WaitingButtonComponent extends BaseComponent {

  @Input('icon') icon: string;
  @Input('color') color: string = "primary";
  @Input() public myCallback: Function;
  @Output('holdTime') time = new EventEmitter();

  /**
   * De holdable directive zorgt voor het oplopen van de tijd.
   * Geef de wachttijd die je van de holdable directive ontvangt verder aan het aanroepende compone
   * @param $event
   */
  onHoldTimeChanged($event: IHoldableResponse): void {
    this.time.emit($event);
    if ($event.HoldTime == 1000 && this.myCallback) {
      this.myCallback();
    }
  }

  // static CanceledEarly($event: IHoldableResponse): boolean {
  // console.log("WaitingButtonComponent --> CanceledEarly --> $event", $event);

  //   if ($event.Status == 'cancel' && $event.HoldTime > 0)
  //     return true;
  //   else
  //     return false;
  // }

}

