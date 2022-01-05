import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-decision-detail-dialog',
    templateUrl: './decision.detail.dialog.html',
    styleUrls: ["./decision.detail.dialog.scss"],
})
export class DecisionDetailDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DecisionDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
    ) {
    }
}
