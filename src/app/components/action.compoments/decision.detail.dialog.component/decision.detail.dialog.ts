import { Component, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

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
