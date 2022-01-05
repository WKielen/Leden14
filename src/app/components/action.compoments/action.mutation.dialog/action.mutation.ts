import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-action-mutation-dialog',
  templateUrl: './action.mutation.dialog.html',
})

export class ActionMutationDialogComponent extends BaseComponent {
  
  constructor(
    public dialogRef: MatDialogRef<ActionMutationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    ) {
      super()
    }

    public amIBestuur: boolean = this.data.amIBestuur;
    
  /***************************************************************************************************
  / Sluit dialog
  /***************************************************************************************************/
  onChangedAction(actionItem): void {
    this.dialogRef.close(actionItem);
  }
}
