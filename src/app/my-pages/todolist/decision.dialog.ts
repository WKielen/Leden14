import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormValueToDutchDateString } from 'src/app/shared/modules/DateRoutines';
import { BaseComponent } from 'src/app/shared/base.component';
import { AuthService } from 'src/app/services/auth.service';
import { ROLES } from 'src/app/services/website.service';

@Component({
    selector: 'app-decision-dialog',
    templateUrl: './decision.dialog.html',
})

export class DecisionDialogComponent extends BaseComponent implements OnInit {
    actionItemForm = new FormGroup({
        title: new FormControl(
            '',
            [Validators.required]
        ),
        startdate: new FormControl(
          '',
          [Validators.required]
      ),
      bestuuronly: new FormControl(),
      description: new FormControl(),
    });
    public thisIsADecision: boolean = false;
    public amIBestuur: boolean = this.authService.isRole(ROLES.BESTUUR);

    constructor(
        public dialogRef: MatDialogRef<DecisionDialogComponent>,
        public authService: AuthService,
        @Inject(MAT_DIALOG_DATA) public data,
    ) { super()
    }

    ngOnInit(): void {
        this.title.setValue(this.data.data.Title);
        this.startdate.setValue(this.data.data.StartDate);
        this.description.setValue(this.data.data.Description);
        if (this.data.data.Role.indexOf(ROLES.BESTUUR) !== -1) {
          this.bestuuronly.setValue(true);
        }
    }

    /***************************************************************************************************
    / Sluit dialog
    /***************************************************************************************************/
    onSubmit(): void {
        this.data.data.Title = this.title.value;
        this.data.data.StartDate = FormValueToDutchDateString(this.startdate.value);
        this.data.data.Description = this.description.value;
        this.data.data.Role = this.bestuuronly.value ? ROLES.BESTUUR : '';

        this.dialogRef.close(this.data.data);
    }

    /***************************************************************************************************
    / Properties
    /***************************************************************************************************/
    get title() {
        return this.actionItemForm.get('title');
    }
    get startdate() {
        return this.actionItemForm.get('startdate');
    }
    get description() {
        return this.actionItemForm.get('description');
    }
    get bestuuronly() {
      return this.actionItemForm.get('bestuuronly');
    }
}
