/***************************************************************************************************
/ This record is sent to the dialog
/***************************************************************************************************/
export class DialogRecord {
  public displayDaysOfWeek: Array<number>;
  public downloadList: string;
  public showEmptyLines: boolean = false;
  public alertAfterNumberOfDays: number = 0;
}
