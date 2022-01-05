import { Component, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-demo-formcontrol',
  template: `
    <input [(ngModel)]="mijnTekst" type="text" (ngModelChange)="onTextChange($event)">
  `,
  providers: [{
    provide: FormControl,
    useExisting: DemoFormControlComponent
  }]
})

export class DemoFormControlComponent implements OnInit, ControlValueAccessor {

  public mijnTekst: string = '';

  constructor(
    @Optional() @Self() public thisControl: NgControl,
  ) {
    if (this.thisControl != null) {
      this.thisControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.mijnTekst == '') {
      this.thisControl.control?.setErrors({});  // we maken de control invalid
    }
  }

  onTextChange($event) {
    console.log("DemoFormControlComponent --> onTextChange --> $event", $event);
    if ($event == '') {
      this.thisControl.control?.setErrors({});  // we maken de control invalid
    }
    else {
      this.thisControl.control?.setErrors(null); // de control wordt weer valid.
    }
    this.thisControl.control.setValue($event);
  }

  /***************************************************************************************************
  / Implementatie van ControlValueAccessor
  /***************************************************************************************************/
  writeValue(value: string): void {
    this.mijnTekst = value;
  }

  OnChange!: (value: string) => {};
  registerOnChange(fn: any): void {
    this.OnChange = fn;
  }

  OnTouched!: () => void;
  registerOnTouched(fn: any): void {
    this.OnTouched = fn;
  }

  /***************************************************************************************************
  / Einde implementatie van ControlValueAccessor
  /***************************************************************************************************/
}
