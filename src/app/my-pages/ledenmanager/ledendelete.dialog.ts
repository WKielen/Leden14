import { Component, Inject, OnInit, Input } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { FormValueToDutchDateString } from 'src/app/shared/modules/DateRoutines';


@Component({
    selector: 'app-ledendelete-dialog',
    templateUrl: './ledendelete.dialog.html',
})
export class LedenDeleteDialogComponent implements OnInit {
    ledenItemForm = new UntypedFormGroup({
        opzegDatum: new UntypedFormControl ('', [Validators.required]),
    });

    constructor(
        public dialogRef: MatDialogRef<LedenDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        private adapter: DateAdapter<any>) {
        this.adapter.setLocale('nl');
    }

    ngOnInit(): void {
        this.opzegDatum.setValue(this.data.data.LidTot);
        //console.log('received by dialog', this.data.data);
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onSubmit(): void {
        this.data.data.LidTot = FormValueToDutchDateString(this.opzegDatum.value);
        this.dialogRef.close(this.data.data);
    }

/***************************************************************************************************
/ Properties
/***************************************************************************************************/
    get opzegDatum() {
        return this.ledenItemForm.get('opzegDatum');
    }
}
