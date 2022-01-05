import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-agenda-dialog',
    templateUrl: './agenda.dialog.html',
})
export class AgendaDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<AgendaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        ) {
    }

    /***************************************************************************************************
    / Sluit dialog
    /***************************************************************************************************/
    onChangedEvenement($event): void {
        this.dialogRef.close($event);
    }
}
