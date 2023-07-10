import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { ActionItem } from 'src/app/services/action.service';
import { ROLES } from 'src/app/services/website.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { FormValueToDutchDateString } from 'src/app/shared/modules/DateRoutines';

@Component({
  selector: 'app-decision-mutation-form',
  templateUrl: './decision.mutation.form.component.html',
  styleUrls: ['./decision.mutation.form.component.scss']
})
export class DecisionMutationFormComponent extends BaseComponent implements OnInit {
  // TODO: wat doen we nu met die bestuuronly flag????

  actionItemForm = new UntypedFormGroup({
    title: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    startdate: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    bestuuronly: new UntypedFormControl(),
    description: new UntypedFormControl(),
  });

  @Input() actionItem: ActionItem = {};
  @Input() amIBestuur: boolean = false;
  @Output() changedAction: EventEmitter<ActionItem> = new EventEmitter<ActionItem>();

  ngOnInit(): void {
    this.title.setValue(this.actionItem.Title);
    this.startdate.setValue(this.actionItem.StartDate);
    this.description.setValue(this.actionItem.Description);
    if (this.actionItem.Role.indexOf(ROLES.BESTUUR) !== -1) {
      this.bestuuronly.setValue(true);
    }
  }


  /***************************************************************************************************
   / Sluit dialog
   /***************************************************************************************************/
  onSubmit(): void {
    this.actionItem.Title = this.title.value;
    this.actionItem.StartDate = FormValueToDutchDateString(this.startdate.value);
    this.actionItem.Description = this.description.value;
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
  get description(): AbstractControl {
    return this.actionItemForm.get('description');
  }
  get bestuuronly(): AbstractControl {
    return this.actionItemForm.get('bestuuronly');
  }
}
