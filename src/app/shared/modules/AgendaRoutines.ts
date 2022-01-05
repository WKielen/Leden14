import { AgendaItem } from "src/app/services/agenda.service";
import * as moment from 'moment';
import { SnackbarTexts } from "../error-handling/SnackbarTexts";
import { AppError } from "../error-handling/app-error";
import { DuplicateKeyError } from "../error-handling/duplicate-key-error";

export function CheckImportedAgenda(contents: string): AgendaItem[] {
  let agendaItems: AgendaItem[] = [];
  let lines: string[] = contents.split('\n');
  let columns: string[] = lines[0].split(';');
  if (!CheckHeaderItemAgenda(0, columns[0], 'Id')) { return null; }
  if (!CheckHeaderItemAgenda(1, columns[1], 'Datum')) { return null; }
  if (!CheckHeaderItemAgenda(2, columns[2], 'Tijd')) { return null; }
  if (!CheckHeaderItemAgenda(3, columns[3], 'EvenementNaam')) { return null; }
  if (!CheckHeaderItemAgenda(4, columns[4], 'Lokatie')) { return null; }
  if (!CheckHeaderItemAgenda(5, columns[5], 'Type')) { return null; }
  if (!CheckHeaderItemAgenda(6, columns[6], 'DoelGroep')) { return null; }
  if (!CheckHeaderItemAgenda(7, columns[7], 'Toelichting')) { return null; }
  if (!CheckHeaderItemAgenda(8, columns[8], 'Inschrijven')) { return null; }
  if (!CheckHeaderItemAgenda(9, columns[9], 'Inschrijfgeld')) { return null; }
  if (!CheckHeaderItemAgenda(10, columns[10], 'BetaalMethode')) { return null; }
  if (!CheckHeaderItemAgenda(11, columns[11], 'ContactPersoon')) { return null; }
  if (!CheckHeaderItemAgenda(12, columns[12], 'Vervoer')) { return null; }
  if (!CheckHeaderItemAgenda(13, columns[13], 'VerzamelAfspraak')) { return null; }
  if (!CheckHeaderItemAgenda(14, columns[14], 'Extra1')) { return null; }

  for (let i = 1; i < lines.length; i++) {
    columns = lines[i].split(';');
    let agendaItem = new AgendaItem();
    agendaItem.Datum = CopyColumn(columns[1]).split('/').join('-');
    agendaItem.Tijd = CopyColumn(columns[2]);
    agendaItem.EvenementNaam = CopyColumn(columns[3]);
    agendaItem.Lokatie = CopyColumn(columns[4]);
    agendaItem.Type = CopyColumn(columns[5]);
    agendaItem.DoelGroep = CopyColumn(columns[6]);
    agendaItem.Toelichting = CopyColumn(columns[7]);
    agendaItem.Inschrijven = CopyColumn(columns[8]);
    agendaItem.Inschrijfgeld = CopyColumn(columns[9]);
    agendaItem.BetaalMethode = CopyColumn(columns[10]);
    agendaItem.ContactPersoon = CopyColumn(columns[11]);
    agendaItem.Vervoer = CopyColumn(columns[12]);
    agendaItem.VerzamelAfspraak = CopyColumn(columns[13]);
    agendaItem.Extra1 = CopyColumn(columns[14]);

    if (agendaItem.Type == '') {
      agendaItem.Type = "T";
    }
    if (agendaItem.DoelGroep == '') {
      agendaItem.DoelGroep = "T";
    }
    if (agendaItem.Extra1 == '') {
      agendaItem.Extra1 = "2";
    }
    // console.log(agendaItem.Datum, moment(agendaItem.Datum, this.formats, true).isValid())

    if (agendaItem.Datum != '' && agendaItem.EvenementNaam != '' &&
      moment(agendaItem.Datum, this.formats, true).isValid()
    ) {
      // Ik draai hier de datum om. Kan niet zo snel een goede methode vinden. Daarom maar handmatig.
      let dateFormat: string[] = agendaItem.Datum.split('-');
      agendaItem.Datum = dateFormat[2] + "-" + dateFormat[1] + "-" + dateFormat[0];
      agendaItems.push(agendaItem);
    }
  }
  return agendaItems;
}

function CheckHeaderItemAgenda(columnNbr: number, columnValue: string, columnName: string): boolean {
  if (columnValue.trim() != columnName.trim()) {
    this.showSnackBar("Fout bij inlezen. Kolom " + columnNbr + " moet de waarde " + columnName + " hebben", '');
    console.log('Error', columnNbr, columnValue, columnName);
    return false;
  }
  return true;
}

function CopyColumn(arg: string | null | undefined): any {
  if (arg != null && arg != undefined && arg != '') {
    return arg;
  }
  return '';
}

export function AddImportedAgendaToDB(agendaItems: AgendaItem[]): void {
  agendaItems.forEach(element => {
    this.agendaService.create$(element)
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessNewRecord, '');
        },
        error: (error: AppError) => {
          if (error instanceof DuplicateKeyError) {
            this.showSnackBar(SnackbarTexts.DuplicateKey, '');
          } else { throw error; }
        }
      })
  });
}
