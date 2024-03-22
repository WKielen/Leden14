import { Component, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
    selector: 'app-registration-detail-dialog',
    templateUrl: './registration.detail.dialog.html',
    styles: [` td { text-align: left; vertical-align: top; }`, 
    `h2 { margin: 0px; }`],
})
export class RegistrationDetailDialogComponent extends BaseComponent {
    constructor(
        public dialogRef: MatDialogRef<RegistrationDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
    ) {
        super()
    }
}
