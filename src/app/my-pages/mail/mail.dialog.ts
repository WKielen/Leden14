import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';
import { MailItem, MailService } from 'src/app/services/mail.service';
import { ParentComponent } from 'src/app/shared/parent.component';
import { catchError, concatMap, delay, from, map, Observable, of, tap, toArray } from 'rxjs';

@Component({
  selector: 'app-mail-dialog',
  templateUrl: './mail.dialog.html',
})

export class MailDialogComponent extends ParentComponent {

  ckbTest: boolean = true;
  percentageComplete: number = 0;
  output: string = '';

  constructor(
    public dialogRef: MatDialogRef<MailDialogComponent>,
    private mailService: MailService,
    protected snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public MailItems: MailItem[],
  ) {
    super(snackBar)
    console.log('data from caller', this.MailItems);
  }

  /***************************************************************************************************
  / delayedForEach is een extensie op de foreach. Na iedere iteratie wordt er een periode gewacht.
  / Na alle iteraties wordt er nog een functie uitgevoerd.
  /***************************************************************************************************/
  onSendMail(): void {
  const results: { email: string; ok: boolean; name:string }[] = [];

  from(this.MailItems).pipe(
    concatMap((item, idx) =>
      this.processLid(item).pipe(
        delay(1000),
        tap(ok => {
          results.push({ email: item.To, ok: ok, name: item.ToName });
          this.percentageComplete = (idx + 1) * 100 / this.MailItems.length;
        })
      )
    ),
    toArray()
  )
  .subscribe({
    next: () => {
      // Build report
      let report = "Mail Report\n\n";
      results.forEach(r => {
        report += `${r.ok ? "OK   " : "FAIL "} - ${r.name} <${r.email}>\n`;
      });

      // Download report if test mode
      if (this.ckbTest) {
        const dd = new DynamicDownload();
        dd.dynamicDownloadTxt(report, 'MailReport', 'txt');
      }

      // Snackbar
      const allOk = results.every(r => r.ok);
      this.showSnackBar(allOk
        ? 'Mail verstuurd.'
        : 'Fout! Een of meerdere mails zijn niet verstuurd.'
      );

      // Close dialog after 3 seconds
      setTimeout(() => this.dialogRef.close(), 3000);
    },

    error: err => {
      console.error("Unexpected error in mail pipeline", err);
      this.showSnackBar('Er is een onverwachte fout opgetreden.');
    }
  });
}


  /***************************************************************************************************
  /***************************************************************************************************/
  processLid(mailItem: MailItem): Observable<boolean> {

    if (this.developmentMode) {
      mailItem.To = "wim_kielen@hotmail.com";
    }

    // // TEST MODE → no mail, only write to output
    // if (this.ckbTest) {
    //   this.output += 'To: ' + mailItem.ToName + " <" + mailItem.To + '>\r\n';
    //   this.output += 'Subject: ' + mailItem.Subject + '\r\n\r\n';
    //   this.output += mailItem.Message.replace('\n', '\r\n') + '\r\n';
    //   this.output += "------------------------------------------------------------\r\n";

    //   return of(true); // always OK in test mode
    // }

    // REAL MAIL MODE
    return this.mailService.mail$([mailItem]).pipe(
      map(() => true),
      catchError(err => {
        return of(false);
      })
    );
  }


  /***************************************************************************************************
  / Cancel button pressed
  /***************************************************************************************************/
  onCancel(): void {
    // this.MailItems.clearTimeout();
    this.dialogRef.close();
  }
}


