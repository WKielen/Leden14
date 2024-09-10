import { Component, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

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
