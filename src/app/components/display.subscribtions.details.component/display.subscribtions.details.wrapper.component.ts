//<mat-checkbox-list [checkboxDictionary]="myDictionairy" (click)="onRoleClicked($event)"></mat-checkbox-list>
import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { AgendaItem } from 'src/app/services/agenda.service';
import { InschrijvingItem } from 'src/app/services/inschrijving.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';

// De html in de template wordt doorgegeven aan het child component. De events worden echter hier afgehandeld.

@Component({
  selector: 'app-display-subscriptions-details-wrapper',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small><div>
  <app-display-subscriptions-details [AgendaId]="AgendaId" (inschrijvingenList)="onInschrijvingen($event)"></app-display-subscriptions-details>
  <button mat-raised-button color="primary" (click)="onClickDownload()">Download inschrijvingen</button>
`,
  styles: ['button { display: block; margin: 0 auto; }']
})

export class DisplaySubscriptionsAgendaDetailsWrapperComponent extends BaseComponent implements OnInit {
  @Input() AgendaId: string | null = null;
  private inschrijvingenList: any;

  constructor(
  ) {
    super();
  }


  ngOnInit(): void {

  }
  onInschrijvingen(event: any) {
    this.inschrijvingenList = event;
  }




// "'" + formatDate(minMandateDate, 'yyyy-MM-dd', 'nl');
  /**
   * Creates a list with gray members
   */
  async onClickDownload(): Promise<void> {
    let localList: string = '';
    let fileName: string = 'Inschrijvingen_';

    this.inschrijvingenList.forEach((agendaWithInschrijvingen: { agenda: AgendaItem, inschrijvingen: InschrijvingItem[] }) => {
      localList += `Evenement: ${agendaWithInschrijvingen.agenda.EvenementNaam}\n`;
      agendaWithInschrijvingen.inschrijvingen.forEach((inschrijving: any) => {
        localList += `; ${inschrijving.Naam};${inschrijving.Email};${inschrijving.ExtraInformatie} `;
        let lidItem = inschrijving.Lid;
        localList += `;${lidItem.VolledigeNaam};${lidItem.Naam};${lidItem.Voornaam};${lidItem.Tussenvoegsel};${lidItem.Achternaam};${lidItem.BondsNr}`;
        localList += "; " + lidItem.GeboorteDatum; //The leading space tells Excel that the cell contains text, not a date, so it won't auto-format or convert the value.
        localList += "; " + lidItem.GeboorteDatum2;
        localList += `;${lidItem.Leeftijd};${lidItem.Geslacht};${lidItem.Rating};${lidItem.LicentieJun};${lidItem.LicentieSen}`;
        localList += `;${lidItem.LeeftijdCategorieBond};${lidItem.LidBond.toDutchTextString()};`
        localList += `\n`;
      });
      localList += `\n`;
    });

    let dynamicDownload = new DynamicDownload();
    fileName += new Date().to_YYYY_MM_DD();
    dynamicDownload.dynamicDownloadTxt(localList, fileName, 'csv');
  }


}
