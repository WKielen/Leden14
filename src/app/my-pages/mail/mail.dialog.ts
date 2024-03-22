import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';
import { MailItem, MailService } from 'src/app/services/mail.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { ParentComponent } from 'src/app/shared/parent.component';
import { ServiceUnavailableError } from 'src/app/shared/error-handling/service-unavailable-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';

@Component({
  selector: 'app-mail-dialog',
  templateUrl: './mail.dialog.html',
})

export class MailDialogComponent extends ParentComponent {

  ckbTest: boolean = false;
  percentageComplete: number = 0;
  output: string = '';

  constructor(
    public dialogRef: MatDialogRef<MailDialogComponent>,
    private mailService: MailService,
    protected snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public MailItems,  // wordt gevuld vanuit het component. Letop: geen type toevoegen
  ) {
    super(snackBar)
    console.log('data from caller', this.MailItems);
  }

  /***************************************************************************************************
  / delayedForEach is een extensie op de foreach. Na iedere iteratie wordt er een periode gewacht.
  / Na alle iteraties wordt er nog een functie uitgevoerd.
  /***************************************************************************************************/
  onSendMail(): void {
    let mailWentOkay = true;
    this.MailItems.delayedForEach(function (item, idx, lijst) {
      // console.log(item, idx, lijst);
      let result: boolean = this.processLid(item);
      if (!result) {
        mailWentOkay = false;
        console.log('mail result', result);

      }
      this.percentageComplete = (idx + 1) * 100 / this.MailItems.length;

    }, 1000, this,
      // Onderstaande functie wordt uitgevoerd wanneer de array doorlopen is.
      // lijst param wordt niet gebruikt maar staat er als voorbeeld.
      function (context, lijst) {
        if (context.ckbTest) {
          let dynamicDownload = new DynamicDownload();
          dynamicDownload.dynamicDownloadTxt(context.output, 'My mails', 'txt');
        }

        if (mailWentOkay) {
          context.showSnackBar('Mail verstuurd.');
        } else {
          context.showSnackBar('Fout! Een of meerdere mails zijn niet verstuurd.');
        }

        setTimeout(function () {// na 3 sec sluit dialog automatisch
          context.MailItems.clearTimeout();
          context.dialogRef.close();
        }, 3000);

        console.log("done!");
      }
    );
  }

  /***************************************************************************************************
  / Als de test checkbox true is dan worden de mails in een tekst bestand geschreven
  / Anders worden de mails gewoon verstuurd.
  /***************************************************************************************************/
  processLid(mailItem: MailItem): boolean {
    let returnBoolean = true;

    if (this.developmentMode) {
      mailItem.To = "wim_kielen@hotmail.com";
    }

    if (this.ckbTest) {

      this.output += 'To: ' + mailItem.ToName + " <" + mailItem.To + '>\r\n';

      this.output += 'Subject: ' + mailItem.Subject + '\r\n';
      this.output += '\r\n';

      this.output += mailItem.Message.replace('\n', '\r\n') + '\r\n';
      this.output += "-----------------------------------------------------------------------------------------\r\n";
    }
    else {

      let mailItems = new Array<MailItem>();
      mailItems.push(mailItem);

      let sub = this.mailService.mail$(mailItems)
        .subscribe({
          next: (data) => {
            let result = data as string;
            console.log('result van mailService', result);
          },
          error: (error: AppError) => {
            console.log("MailDialogComponent --> processLid --> error", error);
            returnBoolean = false;
            // console.log('error', error instanceof ServiceUnavailableError);

            if (error instanceof ServiceUnavailableError) {
              this.showSnackBar(SnackbarTexts.ServiceNotAvailable);
            } else {
              this.showSnackBar(SnackbarTexts.SevereError);
            }
          }
        })
      this.registerSubscription(sub);
    }
    return returnBoolean;
  }

  /***************************************************************************************************
  / Cancel button pressed
  /***************************************************************************************************/
  onCancel(): void {
    this.MailItems.clearTimeout();
    this.dialogRef.close();
  }
}


