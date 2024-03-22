import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { ActionItem } from 'src/app/services/action.service';
import { ROLES } from 'src/app/services/website.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { FormValueToDutchDateString } from 'src/app/shared/modules/DateRoutines';

@Component({
  selector: 'app-action-mutation-form',
  templateUrl: './action.mutation.form.component.html',
  styleUrls: ['./action.mutation.form.component.scss']
})
export class ActionMutationFormComponent extends BaseComponent implements OnInit {

  actionItemForm = new UntypedFormGroup({
    title: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    startdate: new UntypedFormControl(),
    targetdate: new UntypedFormControl(),
    description: new UntypedFormControl(),
    holdername: new UntypedFormControl(),
    bestuuronly: new UntypedFormControl(),
  });

  @Input() actionItem: ActionItem = {};
  @Input() amIBestuur: boolean = false;
  @Output() changedAction: EventEmitter<ActionItem> = new EventEmitter<ActionItem>();


  // TODO: wat doen we nu met die bestuuronly flag????
  ngOnInit(): void {
    this.title.setValue(this.actionItem.Title);
    this.startdate.setValue(this.actionItem.StartDate);
    this.targetdate.setValue(this.actionItem.TargetDate);
    this.description.setValue(this.actionItem.Description);
    if (this.actionItem.Role.indexOf(ROLES.BESTUUR) !== -1) {
      this.bestuuronly.setValue(true);
    }
    this.holdername.setValue(this.actionItem.HolderName);
  }

  /***************************************************************************************************
   / Sluit dialog
   /***************************************************************************************************/
  onSubmit(): void {
    this.actionItem.Title = this.title.value;
    this.actionItem.TargetDate = FormValueToDutchDateString(this.targetdate.value);
    this.actionItem.StartDate = FormValueToDutchDateString(this.startdate.value);
    this.actionItem.Description = this.description.value;
    this.actionItem.HolderName = this.holdername.value;
    this.actionItem.Role = this.bestuuronly.value ? ROLES.BESTUUR : '';
    this.changedAction.emit(this.actionItem);
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get title(): AbstractControl {
    return this.actionItemForm.get('title');
  }
  get startdate(): AbstractControl {
    return this.actionItemForm.get('startdate');
  }
  get targetdate(): AbstractControl {
    return this.actionItemForm.get('targetdate');
  }
  get description(): AbstractControl {
    return this.actionItemForm.get('description');
  }
  get holdername(): AbstractControl {
    return this.actionItemForm.get('holdername');
  }
  get bestuuronly(): AbstractControl {
    return this.actionItemForm.get('bestuuronly');
  }
}
