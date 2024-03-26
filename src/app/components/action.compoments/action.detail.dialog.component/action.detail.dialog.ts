import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-action-detail-dialog',
    templateUrl: './action.detail.dialog.html',
    styleUrls: ["./action.detail.dialog.scss"],
})
export class ActionDetailDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ActionDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
    ) {
    }
}
