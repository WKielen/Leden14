import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LedenService, LedenItemExt, LedenItem, LidTypeValues, BetaalWijzeValues } from '../../services/leden.service';
import { ExportToCsv } from 'export-to-csv';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';
import { AgendaService } from 'src/app/services/agenda.service';
import * as moment from 'moment';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { ReplaceKeywords } from 'src/app/shared/modules/ReplaceKeywords';
import { ReadTextFileService } from 'src/app/services/readtextfile.service';
import { CheckImportedAgenda, AddImportedAgendaToDB } from 'src/app/shared/modules/AgendaRoutines';
import { ActionItem, ActionService, ACTIONSTATUS } from 'src/app/services/action.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { lastValueFrom } from 'rxjs';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { MailItemTo } from 'src/app/services/mail.service';
import { RatingItem, RatingService } from 'src/app/services/rating.service';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { ExportRatingFile, ExportRatingFileRecord } from 'src/app/shared/modules/ExportRatingFile';
@Component({
  selector: 'app-download-page',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})

// De CSV download is een externe package 'export-to-csv
// De TXT download zit in common en is afgeleid van een voorbeeld. Dit voorbeeld kan overigens ook JSON.

export class DownloadComponent extends ParentComponent implements OnInit {
  csvOptions = {
    fieldSeparator: ';',
    quoteStrings: '"',
    decimalSeparator: ',',
    showLabels: true,
    showTitle: false,
    title: 'Ledenlijst',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    filename: ''
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
  };

  ledenLijstKeuzes: string[] = ['Volledig', 'E-Mail', 'Ratings'];
  ledenLijstKeuze: string = this.ledenLijstKeuzes[0];
  ledenSelectieKeuzes: string[] = ['Alle Leden', 'Volwassenen', 'Jeugd', 'Old Stars', 'Nieuwegein-pas'];
  ledenSelectieKeuze: string = this.ledenSelectieKeuzes[0];
  ledenArray = new Array<LedenItemExt>();
  retiredArray = new Array<LedenItemExt>();
  selectedLid = new LedenItemExt();
  vcard: string = '';
  dateFrom: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(private ledenService: LedenService,
    private agendaService: AgendaService,
    private actionService: ActionService,
    public readTextFileService: ReadTextFileService,
    private ratingService: RatingService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe({
          next: (data: Array<LedenItemExt>) => {
            this.ledenArray = data;
          },
          error: (error: AppError) => {
            console.error(error);
          }
        })
    );

    this.registerSubscription(
      this.ledenService.getRetiredMembers$()
        .subscribe({
          next: (data: Array<LedenItemExt>) => {
            this.retiredArray = data;
          },
          error: (error: AppError) => {
            console.error(error);
          }
        })
    );


    this.registerSubscription(
      this.readTextFileService.read('templates/template_vcard.txt')
        .subscribe({
          next: (data) => {
            this.vcard = data;
          },
          error: (error: AppError) => {
            console.error(error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Download button in Download Ledenlijst box
  /***************************************************************************************************/
  onClickLedenLijst(): void {
    // console.log("DownloadComponent --> onClickLedenLijst --> ledenLijstKeuze", this.ledenLijstKeuze[0]);
    // console.log("DownloadComponent --> onClickLedenLijst --> this.ledenSelectieKeuzes", this.ledenSelectieKeuzes[3]);
    switch (this.ledenLijstKeuze) {
      case this.ledenLijstKeuzes[0]: {
        if (this.ledenSelectieKeuze == 'Old Stars' ) {
          this.createLijstjePerLidLedenlijst('TTVN Ledenlijst Old Stars');
          // this.createLijstjePerLidLedenlijst2('TTVN Ledenlijst Old Stars');
        } 
        this.createLedenlijst('TTVN Ledenlijst');

        break;
      }
      case this.ledenLijstKeuzes[1]: {
        this.createMailLijst('TTVN Maillijst');
        break;
      }
      case this.ledenLijstKeuzes[2]: {
        this.createRatingLijst('TTVN Ratinglijst');
        break;
      }
      default: {
        this.showSnackBar(SnackbarTexts.SevereError, '');
      }
    }
  }

  /***************************************************************************************************
  / Download ledenlijst
  /***************************************************************************************************/
  private async createLedenlijst(type: string): Promise<void> {
    let localList: Array<any> = this.selectLeden();
    this.csvOptions.filename = type + ' ' + localList[1] + ' ' + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(localList[0]);
  }


  /***************************************************************************************************
  / Download ledenlijst voor de Oldstars omdat zij niet om kunnen gaan met Excel
  /***************************************************************************************************/
  private async createLijstjePerLidLedenlijst(type: string): Promise<void> {
    let localList: Array<any> = this.selectLeden();
    let localEmailString: string = '';
    this.csvOptions.filename = type + ' ' + localList[1] + ' ' + new Date().to_YYYY_MM_DD();

    localEmailString += 'Naam'.padEnd(40, ' ');
    localEmailString += 'Adres'.padEnd(50, ' ');
    localEmailString += 'Geb.Datum'.padEnd(12, ' ');
    localEmailString += 'Mail'.padEnd(40, ' ');
    localEmailString += 'Telefoon'.padEnd(12, ' ');
    localEmailString += '\n';

    localEmailString += ''.padStart(40 -1, '-') + ' ';
    localEmailString += ' '.padStart(50, '-');
    localEmailString += ' '.padStart(12, '-');
    localEmailString += ' '.padStart(40, '-');
    localEmailString += ' '.padStart(12, '-');
    localEmailString += '\n';

    localList[0].forEach((element: LedenItemExt) => {
      localEmailString += element.VolledigeNaam.padEnd(40, ' ');

      localEmailString += (element.Adres + ', ' + element.Postcode + ', ' + element.Woonplaats).padEnd(50, ' ');
      localEmailString += element.GeboorteDatum.padEnd(12, ' ');
      localEmailString += element.Email1.padEnd(40, ' ');
      if (element.Mobiel != '' && element.Mobiel != null) {
        localEmailString += element.Mobiel.padEnd(12, ' ');
      } else {
        localEmailString += element.Telefoon.padEnd(12, ' ');
      }

      
      localEmailString += '\n';
    });

    let dynamicDownload = new DynamicDownload();
    this.csvOptions.filename += new Date().to_YYYY_MM_DD();
    dynamicDownload.dynamicDownloadTxt(localEmailString, this.csvOptions.filename, 'txt');


  }

  /***************************************************************************************************
  / Download ledenlijst voor de Oldstars omdat zij niet om kunnen gaan met Excel
  /***************************************************************************************************/
  private async createLijstjePerLidLedenlijst2(type: string): Promise<void> {
    let localList: Array<any> = this.selectLeden();
    let localEmailString: string = '';
    this.csvOptions.filename = type + ' ' + localList[1] + ' ' + new Date().to_YYYY_MM_DD();

    localList[0].forEach((element: LedenItemExt) => {
      localEmailString += element.VolledigeNaam + '\n';
      localEmailString += element.Adres + ', ' + element.Postcode + ', ' + element.Woonplaats + '\n';
      localEmailString += element.GeboorteDatum + '\n';
      localEmailString += element.Email1 + '\n';
      if (element.Mobiel != '' && element.Mobiel != null) {
        localEmailString += element.Mobiel + '\n';
      } else {
        localEmailString += element.Telefoon + '\n';
      }
      localEmailString += '\n';

    });

    let dynamicDownload = new DynamicDownload();
    this.csvOptions.filename += new Date().to_YYYY_MM_DD();
    dynamicDownload.dynamicDownloadTxt(localEmailString, this.csvOptions.filename, 'txt');


  }


  /***************************************************************************************************
  / Download maillijst
  /***************************************************************************************************/
  async createMailLijst(type: string): Promise<void> {
    let localList: Array<any> = this.selectLeden();
    let localEmailString: string = '';
    this.csvOptions.filename = type + ' ' + localList[1] + ' ' + new Date().to_YYYY_MM_DD();

    localList[0].forEach((element: LedenItemExt) => {
      const emailList = LedenItem.GetEmailList(element);
      emailList.forEach((element: MailItemTo) => {
        localEmailString += element.ToName + '<' + element.To + '>' + ';';
      });
    });

    let dynamicDownload = new DynamicDownload();
    dynamicDownload.dynamicDownloadTxt(localEmailString, this.csvOptions.filename, 'txt');
  }

  /***************************************************************************************************
  / Download a list with all updates since a data
  /***************************************************************************************************/
  onChangedDate($event): void {
    this.dateFrom = new Date($event.value.format('YYYY-MM-DD'));
  }

  async onClickUpdates(): Promise<void> {
    // let localList: Array<any> = this.selectLeden();
    let localEmailString: string = 'Nieuwe leden\n\n';
    this.csvOptions.filename = "In- en uitschrijvingen vanaf" + ' ' + this.dateFrom.to_YYYY_MM_DD();


    this.ledenArray.forEach((lid: LedenItemExt) => {
      const emailList = LedenItem.GetEmailList(lid);
      if (new Date(lid.LidVanaf) < this.dateFrom)
        return;

      let singleLine = '';
      emailList.forEach((element: MailItemTo) => {
        singleLine += lid.Naam + ';' + lid.LidVanaf + ';' + element.ToName + '<' + element.To + '>' + ';\n';
      });
      localEmailString += singleLine;
    });

    localEmailString += '\nOpgezegd\n\n';
    this.retiredArray.forEach((lid: LedenItemExt) => {
      const emailList = LedenItem.GetEmailList(lid);
      if (lid.Opgezegd == '1' && new Date(lid.LidTot) < this.dateFrom)
        return;

      let singleLine = '';
      emailList.forEach((element: MailItemTo) => {
        singleLine += lid.Naam + ';' + lid.LidTot + ';' + element.ToName + '<' + element.To + '>' + ';\n';
      });
      localEmailString += singleLine;
    });

    let dynamicDownload = new DynamicDownload();
    dynamicDownload.dynamicDownloadTxt(localEmailString, this.csvOptions.filename, 'csv');
  }

  /***************************************************************************************************
  / Create list with ratings
  /***************************************************************************************************/
  async createRatingLijst(type: string): Promise<void> {
    let localList: Array<ExportRatingFileRecord> = [];
    let getLedenSelectie = this.selectLeden();  // * Geeft array terug


    getLedenSelectie[0].forEach((lid: LedenItemExt) => {
      if (lid.Rating == undefined || lid.Rating == 0) return;
      let record = new ExportRatingFileRecord();
      record.Lid = lid;
      record.Naam = '';
      record.Email = '';
      record.ExtraInformatie = '';
      localList.push(record);
    })

    this.csvOptions.filename = type + ' ' + getLedenSelectie[1] + ' ' + new Date().to_YYYY_MM_DD();
    ExportRatingFile(localList, this.csvOptions.filename);
  }


  /**
   * Creates a list with gray members
   */
  async onGrijzeLeden(): Promise<void> {
    let localList: string = '';
    let fileName: string = 'Grijze leden'

    this.ledenArray.forEach((element: LedenItemExt) => {
      if (!element.BondsNr || !element.LidBond.toBoolean())
        localList += element.VolledigeNaam + ',' + element.BondsNr + '\n';
    });

    let dynamicDownload = new DynamicDownload();
    fileName += new Date().to_YYYY_MM_DD();
    dynamicDownload.dynamicDownloadTxt(localList, fileName, 'txt');
  }


  //***************************************************************************************************/
  //                                                                                                  */
  //       Agenda functions
  //                                                                                                  */
  //***************************************************************************************************/

  /***************************************************************************************************
  / Exporteer de agenda
  /***************************************************************************************************/
  formats = [moment.ISO_8601, 'DD-MM-YYYY', 'D-MM-YYYY', 'DD-M-YYYY', 'D-M-YYYY'];  //

  async onClickAgendaLijst(): Promise<void> {
    let agendaArray = await this.readAgendaLijst();
    this.csvOptions.filename = "TTVN Agenda " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(agendaArray);
  }

  /***************************************************************************************************
  / Importeer een agenda bestand, controleer het en schrijf het naar de DB
  /***************************************************************************************************/
  async onClickAgendaImport(): Promise<void> {
    let contents = await this.readFileAsText(this.selectedFile);
    let agendaItems = CheckImportedAgenda(contents as string);

    if (agendaItems != null) {
      AddImportedAgendaToDB(agendaItems);
    }
    else {
      this.showSnackBar('De geimporteerde agenda is niet goed.', '');
    }
  }

  /***************************************************************************************************
  / De call wordt SYNC gedaan omdat anders het output betand al wordt gemaakt terwijl de input er nog niet is
  /***************************************************************************************************/
  async readFileAsText(file) {
    let result = await new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => resolve(fileReader.result as string);
      fileReader.readAsText(file);
    });
    return result;
  }

  selectedFile: File | null = null;
  uploadFileName: string = '';

  /***************************************************************************************************
  / Er wordt een input betand geselecteerd voor de agenda
  /***************************************************************************************************/
  onFileSelected($event: any): void {
    let fileList: FileList = $event.target.files as FileList;
    this.selectedFile = fileList[0];
    this.uploadFileName = this.selectedFile.name;
  }

  /***************************************************************************************************
  / De call wordt SYNC gedaan omdat anders het output betand al wordt gemaakt terwijl de input er nog niet is
  /***************************************************************************************************/
  readAgendaLijst(): Promise<Object> {
    // -------------------------------------------------------- :o)
    return lastValueFrom(this.agendaService.getAll$())
      .then(response => {
        return response
      });
    // -------------------------------------------------------- :o)
  }

  //***************************************************************************************************/
  //                                                                                                  */
  //       Action functions
  //                                                                                                  */
  //***************************************************************************************************/

  /***************************************************************************************************
  / Exporteer de agenda
  /***************************************************************************************************/

  async onClickActionList(): Promise<void> {
    let actionArray = <Array<ActionItem>>await this.readActionLijst();

    const logo = `data:image/png;base64,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`;


    const head = [['Nr', 'Start', 'Eind', 'Door', 'Actie', 'Toelichting']];
    const decisionheader = [['Nr', 'Datum', 'Besluit', 'Toelichting']];

    const leftborder: number = 15;
    const headersize: number = 16;
    const linesize: number = 12;
    const topborder: number = 40;
    const lineheight: number = 6;
    let currentposition: number = topborder;
    // https://parall.ax/products/jspdf
    // https://rawgit.com/MrRio/jsPDF/master/docs/index.html
    // https://github.com/simonbengtsson/jsPDF-AutoTable/blob/master/examples/typescript/index.ts

    let doc = new jsPDF();
    doc.addImage(logo, "PNG", 78, 10, 50, 20);


    // OPENSTAANDE ACTIES
    doc.setFontSize(headersize);
    doc.text('Actielijst', leftborder, topborder);
    doc.text('Actielijst', leftborder, topborder);

    doc.setFontSize(linesize);
    currentposition = topborder + 2;

    let data = new Array<any>();
    actionArray.forEach(actionItem => {
      if (actionItem.Status == ACTIONSTATUS.OPEN) {
        let line: Array<string> =
          [actionItem.Id,
          actionItem.StartDate,
          actionItem.TargetDate,
          actionItem.HolderName,
          actionItem.Title,
          actionItem.Description];
        data.push(line);
      }
    });

    autoTable(doc, {
      head: head,
      body: data,
      // didDrawCell: (data) => {
      //   console.log(data.column.index)
      // },
      startY: currentposition
    })

    // HERHALENDE ACTIES

    doc.addPage();
    doc.setFontSize(headersize);
    doc.text('Herhalende acties', leftborder, topborder);
    currentposition = topborder + 2;

    data = [];
    actionArray.forEach((actionItem: ActionItem) => {
      if (actionItem.Status == ACTIONSTATUS.REPEATING) {
        let line: Array<string> =
          [actionItem.Id,
          actionItem.StartDate,
          actionItem.TargetDate,
          actionItem.HolderName,
          actionItem.Title,
          actionItem.Description];
        data.push(line);
      }
    });

    autoTable(doc, {
      head: head,
      body: data,
      // didDrawCell: (data) => {
      //   console.log(data.column.index)
      // },
      startY: currentposition
    })


    // BESLUITEN

    doc.addPage();
    doc.setFontSize(headersize);
    doc.text('Besluiten', leftborder, topborder);
    currentposition = topborder + 2;

    data = [];
    actionArray.forEach(actionItem => {
      if (actionItem.Status == ACTIONSTATUS.DECISION) {
        let line: Array<string> =
          [actionItem.Id,
          actionItem.StartDate,
          actionItem.Title,
          actionItem.Description];
        data.push(line);
      }
    });

    autoTable(doc, {
      head: decisionheader,
      body: data,
      // didDrawCell: (data) => {
      //   console.log(data.column.index)
      // },
      startY: currentposition
    })

    // GESLOTEN ACTIES

    doc.addPage();
    doc.setFontSize(headersize);
    doc.text('Afgehandelde acties', leftborder, topborder);
    currentposition = topborder + 2;

    data = [];
    actionArray.forEach(actionItem => {
      if (actionItem.Status == ACTIONSTATUS.CLOSED) {
        let line: Array<string> =
          [actionItem.Id,
          actionItem.StartDate,
          actionItem.TargetDate,
          actionItem.HolderName,
          actionItem.Title,
          actionItem.Description];
        data.push(line);
      }
    });

    autoTable(doc, {
      head: head,
      body: data,
      // didDrawCell: (data) => {
      //   console.log(data.column.index)
      // },
      startY: currentposition
    })


    // ARCHIEF ACTIES

    doc.addPage();
    doc.setFontSize(headersize);
    doc.text('Archief', leftborder, topborder);
    currentposition = topborder + 2;

    data = [];
    actionArray.forEach(actionItem => {
      if (actionItem.Status == ACTIONSTATUS.ARCHIVED) {
        let line: Array<string> =
          [actionItem.Id,
          actionItem.StartDate,
          actionItem.TargetDate,
          actionItem.HolderName,
          actionItem.Title,
          actionItem.Description];
        data.push(line);
      }
    });

    autoTable(doc, {
      head: head,
      body: data,
      // didDrawCell: (data) => {
      //   console.log(data.column.index)
      // },
      startY: currentposition
    })

    let fileName = "TTVN Actielijst " + new Date().to_YYYY_MM_DD();
    doc.save(fileName + '.pdf')
  }

  /***************************************************************************************************
  / De call wordt SYNC gedaan omdat anders het output betand al wordt gemaakt terwijl de input er nog niet is
  /***************************************************************************************************/
  readActionLijst(): Promise<Object> {
    // -------------------------------------------------------- :o)
    return lastValueFrom(this.actionService.getAllActions$())
      .then(response => {
        return response
      });
    // -------------------------------------------------------- :o)
  }


  /***************************************************************************************************
  / Kies een lid voor het aanmaken van een VCard
  /***************************************************************************************************/
  onUserSelected(lid): void {
    this.selectedLid = lid;
  }

  /***************************************************************************************************
  / Creeer een bestand dat kan worden ingelezen als contact in android of apple
  /***************************************************************************************************/
  onCreateVcard(): void {
    let vcardt = ReplaceKeywords(this.selectedLid, this.vcard);
    let dynamicDownload = new DynamicDownload();
    let fileName = 'Vcard_' + this.selectedLid.VolledigeNaam.split(' ').join('_');
    dynamicDownload.dynamicDownloadTxt(vcardt, fileName, 'vcf');
  }
  /**
   * Determines whether click update ratings on
   */
  onClickUpdateRatings(): void {
    this.registerSubscription(
      this.ratingService.getRatings$()
        .subscribe({
          next: (ratingItems: Array<RatingItem>) => {
            ratingItems.forEach((ratingItem: RatingItem) => {
              let index = this.ledenArray.findIndex((lid: LedenItemExt) => (lid.BondsNr == ratingItem.bondsnr));
              if (index == -1) return;  // zou niet voor mogen komen
              if (isNaN(Number(ratingItem.rating))) return;  // sommige leden hebben een niet numerieke rating --> '---'
              let lid = this.ledenArray[index];
              if (lid.Rating == Number(ratingItem.rating)) return;
              let obj = { "LidNr": lid.LidNr, "Rating": ratingItem.rating, "LicentieJun": ratingItem.junlic, "LicentieSen": ratingItem.senlic };
              this.registerSubscription(
                this.ledenService.update$(obj)
                  .subscribe({
                    error: (error: AppError) => {
                      console.error(error);
                      if (error instanceof NoChangesMadeError) {
                        console.error(SnackbarTexts.NoChanges);
                      } else if (error instanceof NotFoundError) {
                        console.error(SnackbarTexts.NotFound);
                      } else {
                        throw error;
                      }
                    }
                  })
              );
            });
            this.showSnackBar('Ratings aagepast', '');
          },
          error: (error: AppError) => {
            throw error;
          }
        })
    );
  }

  /***************************************************************************************************
  / Select alle leden voor de lijst
  / Als eerste in de array komt een ledenlijst. De tweede is een string met een omschrijving
  /***************************************************************************************************/
  private selectLeden(): Array<any> {
    let localList: LedenItemExt[] = [];
    let selectie = '';

    switch (this.ledenSelectieKeuze) {
      case this.ledenSelectieKeuzes[0]: {  // Alle Leden
        localList = this.ledenArray;
        break;
      }
      case this.ledenSelectieKeuzes[1]: {   // Alleen volwassenen
        this.ledenArray.forEach((element: LedenItemExt) => {
          if (element.LeeftijdCategorieWithSex.charAt(0) == LidTypeValues.ADULT) {
            localList.push(element);
          }
        });
        selectie = 'Volwassenen';
        break;
      }
      case this.ledenSelectieKeuzes[2]: {  // Alleen jeugd
        this.ledenArray.forEach((element: LedenItemExt) => {
          if (element.LeeftijdCategorieWithSex.charAt(0) == LidTypeValues.YOUTH || element.LeeftijdCategorieBond.startsWith('Senior1')) {
            localList.push(element);
          }
        });
        selectie = 'Jeugd';
        break;
      }
      case this.ledenSelectieKeuzes[3]: {  // Old Stars
        this.ledenArray.forEach((element: LedenItemExt) => {
          if (element.OldStars == '1') {
            localList.push(element);
          }
        });
        selectie = 'Old Stars';
        break;
      }
      case this.ledenSelectieKeuzes[4]: {  // Nieuwegein pas
        this.ledenArray.forEach((element: LedenItemExt) => {
          if (element.BetaalWijze == BetaalWijzeValues.UPAS) {
            localList.push(element);
          }
        });
        selectie = 'Nieuegein-pas';
        break;
      }
    }
    return [localList, selectie];
  }
}
