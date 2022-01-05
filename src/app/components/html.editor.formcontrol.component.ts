import { Component, OnInit, Optional, Self, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-html-editor-formcontrol',
  template: `
    <small class="development" *ngIf="developmentMode">{{ me }}</small>
    <app-html-editor [htmlInputContent]="receivedHtmlInput" (htmlOutputContent)='onHtmlChanged($event)'></app-html-editor>
  `,
  providers: [{
    provide: FormControl,
    useExisting: HtmlEditorFormControlComponent
  }]
})
export class HtmlEditorFormControlComponent extends BaseComponent implements OnInit, ControlValueAccessor {
/***************************************************************************************************
//! LET OP
// * Er zijn twee manieren om de waarde van this control te krijgen
// 1. via de this.websiteItemForm.get('HtmlControl');  in het aanroepende component
// 2. via de eventemmiter
/***************************************************************************************************/

  @Output()
  htmlContent = new EventEmitter<string>(); // Hiermee geven we een gewijzigde html terug

  public receivedHtmlInput:string = '';  // Deze ontvangen we via setvalue

  constructor(
    @Optional() @Self() public thisControl: NgControl,
  ) {
    super();
    if (this.thisControl != null) {
      this.thisControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.receivedHtmlInput == '') {
      this.thisControl.control?.setErrors({});  // we maken de control invalid
    }
  }

  /***************************************************************************************************
  / de inhoud van de HTML is gewijzigd
  /***************************************************************************************************/
  onHtmlChanged ($event) {
    if ($event == '') {
      this.thisControl.control?.setErrors({});  // we maken de control invalid
    }
    else {
      this.thisControl.control?.setErrors(null);
    }

    this.htmlContent.emit($event);
    this.thisControl.control.setValue($event);
  }

  /***************************************************************************************************
  / Implementatie van ControlValueAccessor
  /***************************************************************************************************/
  writeValue(obj: string): void {
    this.receivedHtmlInput = obj;
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
