import { Directive, HostListener, EventEmitter, Output, Input } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';

@Directive({
  selector: '[holdable]'
})
export class HoldableDirective {

  @Input() targetTime: number = 1000;
  @Output() holdTime: EventEmitter<IHoldableResponse> = new EventEmitter();

  private state: Subject<string> = new Subject();

  private cancel: Observable<string>;

  private savedHoldTime: number = 0;

  constructor() {
    this.cancel = this.state.pipe(
      filter(v => v === 'cancel'),
      tap(v => {
        console.log('%cstopped hold', 'color: #ec6969; font-weight: bold;');
        if (this.savedHoldTime < this.targetTime) {
          this.holdTime.emit({ Status: 'early', HoldTime: this.savedHoldTime });  // De knop is te vroeg los gelaten
        }
        this.holdTime.emit({ Status: 'finish', HoldTime: 0 });  //Hier moet hij nul zijn omdat er op wordt getest
      }),
    );

  }

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  onHold() {
    console.log('%cstarted hold', 'color: #5fba7d; font-weight: bold;');
    this.state.next('start');
    const n = 100;
    interval(n).pipe(
      takeUntil(this.cancel),
      tap(v => {
        this.savedHoldTime = v * n;
        if (this.savedHoldTime == 0) {
          this.holdTime.emit({ Status: 'start', HoldTime: this.savedHoldTime });
        } else {
          this.holdTime.emit({ Status: 'run', HoldTime: this.savedHoldTime });
        }
        if (this.savedHoldTime == this.targetTime) {
          this.onExit();
        }
      }),
    )
      .subscribe();
  }

  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  onExit() {
    this.state.next('cancel');
  }

}

export interface IHoldableResponse {
  Status: string,
  HoldTime: number
}
