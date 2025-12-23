import { LedenItemExt } from "src/app/services/leden.service";
import { ExportToCsv } from 'export-to-csv';

export function ExportRatingFile(LedenLijst: Array<ExportRatingFileRecord>, filename: string): void {

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

  LedenLijst.forEach((lid: ExportRatingFileRecord) => {
    let reportItem = new ReportItem();
    // todo kijk of je lege velden uit de lijst kan halen als die vanuit download wordt aangeroepen
    reportItem.OpgegevenNaam = lid.Naam;
    reportItem.Email = lid.Email;
    reportItem.ExtraInformatie = lid.ExtraInformatie;
    reportItem.NaamLedenLijst = lid.Lid.VolledigeNaam;
    reportItem.LeeftijdCategorieBond = lid.Lid.LeeftijdCategorieBond
    reportItem.Voornaam = lid.Lid.Voornaam;
    reportItem.Achternaam = lid.Lid.Achternaam;
    reportItem.Tussenvoegsel = lid.Lid.Tussenvoegsel;
    reportItem.BondsNr = lid.Lid.BondsNr
    reportItem.Geslacht = lid.Lid.Geslacht
    reportItem.GeboorteDatum = lid.Lid.GeboorteDatum;
    reportItem.Rating = (lid.Lid.Rating !== 0 ? lid.Lid.Rating.toString() : '');
    reportItem.Licentie_Jun = lid.Lid.LicentieJun != undefined ? lid.Lid.LicentieJun : '';
    reportItem.Licentie_Sen = lid.Lid.LicentieSen != undefined ? lid.Lid.LicentieSen : '';

    localList.push(reportItem);
  });

  let csvExporter = new ExportToCsv(csvOptions);
  csvExporter.generateCsv(localList);
  console.log("ExportRatingFile --> localList", localList);
}

export class ReportItem {

  OpgegevenNaam?: string = undefined;
  Email?: string = undefined;
  ExtraInformatie?: string = undefined;

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

export class ExportRatingFileRecord {
  Lid = new LedenItemExt();
  Naam = '';
  Email = '';
  ExtraInformatie = '';
}