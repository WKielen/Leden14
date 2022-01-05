import { LedenItemExt } from "src/app/services/leden.service";
import { ExportToCsv } from 'export-to-csv';

export function ExportRatingFile(LedenLijst: Array<any>, filename: string): void {

  let csvOptions = {
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

  let localList: ReportItem[] = [];
  csvOptions.filename = filename;

  LedenLijst.forEach((lid: any) => {
    let reportItem = new ReportItem();
    if (!lid.hasOwnProperty('OpgegevenNaam'))
      delete reportItem['OpgegevenNaam'];
    else
      reportItem.OpgegevenNaam = lid.OpgegevenNaam;
    if (!lid.hasOwnProperty('Email'))
      delete reportItem['Email'];
    else
      reportItem.Email = lid.Email;
    if (!lid.hasOwnProperty('ExtraInformatie'))
      delete reportItem['ExtraInformatie'];
    else
      reportItem.ExtraInformatie = lid.ExtraInformatie;

    reportItem.NaamLedenLijst = lid.VolledigeNaam;
    reportItem.LeeftijdCategorieBond = lid.LeeftijdCategorieBond
    reportItem.Voornaam = lid.Voornaam;
    reportItem.Achternaam = lid.Achternaam;
    reportItem.Tussenvoegsel = lid.Tussenvoegsel;
    reportItem.BondsNr = lid.BondsNr
    reportItem.Geslacht = lid.Geslacht
    reportItem.GeboorteDatum = lid.GeboorteDatum;
    reportItem.Rating = (lid.Rating !== 0 ? lid.Rating.toString() : '');
    reportItem.Licentie_Jun = lid.LicentieJun != undefined ? lid.LicentieJun : '';
    reportItem.Licentie_Sen = lid.LicentieSen != undefined ? lid.LicentieSen : '';

    localList.push(reportItem);
  });

  let csvExporter = new ExportToCsv(csvOptions);
  csvExporter.generateCsv(localList);
}

export class ReportItem {

  OpgegevenNaam: string = '';
  Email: string = '';
  ExtraInformatie: string = '';

  NaamLedenLijst: string = '';
  LeeftijdCategorieBond: string = '';
  Voornaam: string = '';
  Achternaam: string = '';
  Tussenvoegsel: string = '';

  BondsNr: string = '';
  Geslacht: string = '';
  GeboorteDatum: string = '';
  Rating: string = '';
  Licentie_Sen: string = '';
  Licentie_Jun: string = '';

}
