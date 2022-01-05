import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { retry, catchError, map, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable } from 'rxjs/internal/Observable';
import { MailItemTo } from './mail.service';
import { forkJoin, of } from 'rxjs';
import { RatingItem, RatingService } from './rating.service';

@Injectable({
  providedIn: 'root'
})

export class LedenService extends DataService {

  constructor(http: HttpClient,
    protected ratingService: RatingService) {
    super(environment.baseUrl + '/lid', http);
  }

  /**
   * Geeft alle leden terug exclusief opgezegde leden. Als the INCLIBAN param op true staat komen ook
   * de IBAN's mee. Dit is alleen voor de penningmeester
   * Tevens worden er enkele velden aan het record toegevoegd. Deze moeten bij de update weer worden
   * verwijderd.
   * Gets active members$
   * @param [inclIBAN]  include the IBAN in the response
   * @returns current active members as Obserable
   */
  getActiveMembers$(inclIBAN?: boolean): Observable<Array<LedenItemExt>> {
    let subUrl = '/lid/getonlyactivemembers';
    if (inclIBAN) {
      subUrl = '/lid/getonlyactivememberswithiban';
    }

    return this.http.get(environment.baseUrl + subUrl)
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        map(function (value: LedenItemExt[]) {
          let localdata = value;
          localdata.forEach((element: LedenItemExt) => {
            element.Naam = LedenItem.getFullNameAkCt(element.Voornaam, element.Tussenvoegsel, element.Achternaam);
            element.VolledigeNaam = LedenItem.getFullNameVtA(element.Voornaam, element.Tussenvoegsel, element.Achternaam);
            element.LeeftijdCategorieBond = DateRoutines.LeeftijdCategorieBond(new Date(element.GeboorteDatum));
            element.LeeftijdCategorie = DateRoutines.LeeftijdCategorie(new Date(element.GeboorteDatum));
            element.LeeftijdCategorieWithSex = DateRoutines.LeeftijdCategorieWithSex(element);
            element.Leeftijd = DateRoutines.Age(new Date(element.GeboorteDatum));
            if (element.LidType === '0') { element.LidType = ''; }
            if (element.BetaalWijze === '0') { element.BetaalWijze = ''; }
          });
          return localdata;
        })
      );
  }

  /***************************************************************************************************
  / Get the active members enriched with rating figures
  /***************************************************************************************************/
  getActiveMembersWithRatings$(): Observable<Array<LedenItemExt>> {

    let subLeden = this.getActiveMembers$()
      .pipe(
        catchError(err => of(new Array<LedenItemExt>()))
      );

    let subRatings = this.ratingService.getRatings$()
      .pipe(
        catchError(err => of(new Array<RatingItem>()))
      );

    return forkJoin([subLeden, subRatings])
      .pipe(
        map(
          function (data) {
            let ledenLijst = data[0] as Array<LedenItemExt>;

            let ratingLijst = data[1] as Array<RatingItem>;
            ratingLijst.forEach(ratingItem => {
              if (isNaN(Number(ratingItem.rating))) return;  // sommige leden hebben een niet numerieke rating --> '---'
              let index = ledenLijst.findIndex((lid: LedenItemExt) => (lid.BondsNr == ratingItem.bondsnr));
              if (index == -1) return;  // zou niet voor mogen komen

              ledenLijst[index].Rating = Number(ratingItem.rating);
              ledenLijst[index].LicentieJun = ratingItem.junlic;
              ledenLijst[index].LicentieSen = ratingItem.senlic;
            });
            return ledenLijst;
          }
        )
      )
  }

  /**
   * Update lid
   * @param element
   * @returns update$
   */
  update$(element: any): Observable<Object> {

    // Ik heb attributen bij het inlezen toegevoegd. Voor de update moeten ze er af omdat het back-end
    // bji onbekende attributen de gehele call weigert
    delete element['Naam'];
    delete element['VolledigeNaam'];
    delete element['LeeftijdCategorieBond'];
    delete element['LeeftijdCategorie'];
    delete element['LeeftijdCategorieWithSex'];
    delete element['Leeftijd'];
    return super.update$(element);
  }

  /***************************************************************************************************
  / Get a role of a member
  /***************************************************************************************************/

  /**
   * Gets rol$
   * @returns rol$
   */
  getRol$(): Observable<Object> {
    return this.http.get(environment.baseUrl + '/lid/getrol')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      );
  }


  /***************************************************************************************************
  / Get an member item
  /***************************************************************************************************/
  get$(Id: number): Observable<any> {
    return this.http.get(environment.baseUrl + '/lid/get?Id=' + Id)
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }))
  }

  /***************************************************************************************************
  / Get the name of a member
  /***************************************************************************************************/
  getname$(Id: number): Observable<any> {
    return this.http.get(environment.baseUrl + '/lid/getname?Id=' + Id)
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        map(function (value: LedenItemExt) {
          value.Naam = LedenItem.getFullNameAkCt(value.Voornaam, value.Tussenvoegsel, value.Achternaam);
          value.VolledigeNaam = LedenItem.getFullNameVtA(value.Voornaam, value.Tussenvoegsel, value.Achternaam);
          return value;
        })
      )
  }

  /***************************************************************************************************
  / Get a membernumber for a new member
  /***************************************************************************************************/
  getNewLidnr$(): Observable<Object> {
    return this.http.get(environment.baseUrl + '/lid/getnewlidnr')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      );
  }

  /***************************************************************************************************
  / Get alleen JEUGDleden
  /***************************************************************************************************/
  getYouthMembers$(): Observable<Array<LedenItem>> {
    return this.getActiveMembers$(false)
      .pipe(
        map(function (value: LedenItemExt[]) {
          return value.filter(isJeugdlidFilter());
        })
      )
  }

  /***************************************************************************************************
  / Get alleen opgezegde leden
  /***************************************************************************************************/
  getRetiredMembers$(): Observable<Array<LedenItem>> {
    return this.http.get(environment.baseUrl + '/lid/getretiredmembers')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        map(function (value: LedenItemExt[]) {
          let localdata = value;
          localdata.forEach(element => {
            element.Naam = LedenItem.getFullNameAkCt(element.Voornaam, element.Tussenvoegsel, element.Achternaam);
          });
          return localdata;
        })
      );
  }

  /***************************************************************************************************
  / Haal de laatste 5 nieuwe leden en laatste 5 opzeggingen op
  /***************************************************************************************************/
  getMutaties$(): Observable<Array<LedenItem>> {
    return this.http.get(environment.baseUrl + '/lid/laatstemutaties')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        map(function (value: LedenItemExt[]) {
          let localdata = value;
          localdata.forEach(element => {
            element.Naam = LedenItem.getFullNameAkCt(element.Voornaam, element.Tussenvoegsel, element.Achternaam);
            element.LeeftijdCategorieBond = DateRoutines.LeeftijdCategorieBond(new Date(element.GeboorteDatum));
          });
          return localdata;
        })
      );
  }

  // Dit verwijderen nadat we op productie over zijn.
  convert$(): Observable<Object> {
    return this.http.get(environment.baseUrl + '/lid/convert')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      );
  }
}


/***************************************************************************************************
/ Het filter om de goede agendaItems te selecteren. Dit is de techniek als je params wil meegeven
/***************************************************************************************************/
function isJeugdlidFilter() {
  return function (item: LedenItemExt) {
    if (item.LeeftijdCategorieWithSex.substring(0, 1) === LidTypeValues.YOUTH || item.LeeftijdCategorieBond.startsWith('Senior1')) return true;
    return false;
  }
}


/***************************************************************************************************
/ De methods zijn static omdat the methods via een interface niet worden doorgegeven
/***************************************************************************************************/
export class LedenItem {
  // de properties moeten worden geinitaliseerd anders krijg je een fout bij het wegschrijven.
  LidNr: number = 0;
  Voornaam: string = '';
  Achternaam: string = '';
  Tussenvoegsel: string = '';
  Adres: string = '';
  Woonplaats: string = '';
  Postcode: string = '';
  Mobiel: string = '';
  Telefoon: string = '';
  BondsNr: string = '';
  Geslacht: string = '';
  GeboorteDatum: string = '';
  Email1: string = '';
  Email2: string = '';
  IBAN: string = '';
  LidBond: string = '';
  CompGerechtigd: string = '';
  LidType: string = '';
  LidVanaf: string = '';
  Opgezegd: string = '';
  LidTot: string = '';
  Medisch: string = '';
  U_PasNr: string = '';
  PakketTot: string = '';
  BetaalWijze: string = '';
  VastBedrag: number = 0;
  Ouder1_Naam: string = '';
  Ouder1_Email1: string = '';
  Ouder1_Email2: string = '';
  Ouder1_Mobiel: string = '';
  Ouder1_Telefoon: string = '';
  Ouder1_Mobiel2: string = '';
  LicentieSen: string = '';
  LicentieJun: string = '';
  TrainingsGroepen: string = '';
  Rol: string = '';
  Rating: number = 0;
  MagNietOpFoto: string = '';


  /***************************************************************************************************
  / We ontvangen meestal objects via een interface. Dit betekent dat de methods niet mee komen.
  / Je kan dan wel een een object maken met Object.Assign. Hierdoor zijn de methods weer beschikbaar.
  / Omdat dit overal dan moet gebeuren, lijkt me dat veel overhead. Daarom maak in de method Static.
  /***************************************************************************************************
  / ACHTERNAAM, VOORNAAM TUSSENVOEGSEL
  /***************************************************************************************************/
  public static getFullNameAkCt(Voornaam: string, Tussenvoegsel: string, Achternaam: string): string {
    let name = Achternaam + ', ' + Voornaam;
    if (Tussenvoegsel) {
      name += ' ' + Tussenvoegsel;
    }
    return name;
  }

  /***************************************************************************************************
  / VOORNAAM TUSSENVOEGSEL ACHTERNAAM
  /***************************************************************************************************/
  public static getFullNameVtA(Voornaam: string, Tussenvoegsel: string, Achternaam: string): string {
    let name = Voornaam;
    if (Tussenvoegsel) {
      name += ' ' + Tussenvoegsel;
    }
    name += ' ' + Achternaam;
    return name;
  }

  /***************************************************************************************************
  / Geef alle mails van een lid
  /***************************************************************************************************/
  public static GetEmailList(lid: LedenItemExt, primary: boolean = false): Array<MailItemTo> {
    let emails: Array<MailItemTo> = []
    if (lid.Ouder1_Email1) {
      emails.push({ "To": lid.Ouder1_Email1, "ToName": "Ouders van " + lid.Voornaam });
      if (primary) return emails;
    }
    if (lid.Ouder1_Email2) {
      emails.push({ "To": lid.Ouder1_Email2, "ToName": "Ouders van " + lid.Voornaam });
      if (primary) return emails;
    }
    if (lid.Email1) {
      emails.push({ "To": lid.Email1, "ToName": lid.Voornaam });
      if (primary) return emails;
    }
    if (lid.Email2) {
      emails.push({ "To": lid.Email2, "ToName": lid.Voornaam });
    }
    return emails;
  }
}

/***************************************************************************************************
/ Dit zijn de extra velden die bij het inlezen worden toegevoegd aan een liditem.
/***************************************************************************************************/
export class LedenItemExt extends LedenItem {
  Naam: string = '';
  LeeftijdCategorieBond: string = '';
  LeeftijdCategorie: string = '';
  LeeftijdCategorieWithSex: string = '';
  Leeftijd: number = 0;
  VolledigeNaam: string = '';

}

/***************************************************************************************************
/
/***************************************************************************************************/
export class LidTypeValues {
  public static readonly STANDAARD = 'N';
  public static readonly ZWERFLID = 'Z';
  public static readonly DONATEUR = 'D';
  public static readonly CONTRIBUTIEVRIJ = 'V';
  public static readonly PAKKET = 'P';

  public static readonly ADULT = 'V';
  public static readonly YOUTH = 'J';

  public static readonly MALE = 'M';
  public static readonly FEMALE = 'V';

  public static readonly MAXYOUTHAGE = 18;


  public static table: any[] = [
    { Value: LidTypeValues.STANDAARD, Label: 'Standaard' },
    { Value: LidTypeValues.ZWERFLID, Label: 'Zwerflid' },
    { Value: LidTypeValues.DONATEUR, Label: 'Donateur' },
    { Value: LidTypeValues.CONTRIBUTIEVRIJ, Label: 'Contributie vrij' },
    { Value: LidTypeValues.PAKKET, Label: 'Pakket' },
  ];
  // getracht onderstaand met Enums op te lossen.
  // wordt lastig als je in de template en dropdown wil maken met *ngFor
  public static GetLabel(value: string): string {
    if (!value || value === '0') {
      return '';
    }
    return this.table.find(x => x.Value === value).Label;
  }

}

/***************************************************************************************************
/
/***************************************************************************************************/
export class BetaalWijzeValues {
  public static readonly INCASSO = 'I';
  public static readonly REKENING = 'R';
  public static readonly UPAS = 'U';
  public static readonly ZELFBETALER = 'Z';

  public static table: any[] = [
    { Value: BetaalWijzeValues.INCASSO, Label: 'Incasso' },
    { Value: BetaalWijzeValues.REKENING, Label: 'Rekening' },
    { Value: BetaalWijzeValues.UPAS, Label: 'U-Pas' },
    { Value: BetaalWijzeValues.ZELFBETALER, Label: 'Zelfbetaler' },
  ];
  public static GetLabel(value: string): string {
    if (!value) {
      return '';
    }
    return this.table.find(x => x.Value === value).Label;
  }
}

/***************************************************************************************************
/
/***************************************************************************************************/
export class DateRoutines {

  /***************************************************************************************************
  / Leeftijd op dit moment
  /***************************************************************************************************/
  public static Age(birthDate: Date) {
    return this.AgeRel(birthDate, moment().toDate());
  }

  /***************************************************************************************************
  / Leeftijd gerelateerd naar een bepaalde referentie datum
  /***************************************************************************************************/
  public static AgeRel(birthDate: Date, referenceDate: Date): number {
    const birthDateMoment = moment(birthDate);
    let yearsOld = moment(referenceDate).get('years') - birthDateMoment.get('years');
    const tempdate = birthDateMoment.add(yearsOld, 'years').toDate();

    if (referenceDate < tempdate) {
      yearsOld--;
    }
    return yearsOld;
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  private static BondsLeeftijd(birthdate: Date): number {
    const todayMoment = moment();
    const july_1_thisYearMoment = moment((new Date()).getFullYear().toString() + '-07-01');
    let yearsOld = todayMoment.get('years') - moment(birthdate).get('years');

    if (todayMoment < july_1_thisYearMoment) {                   // We zitten voor 1 juli van dit jaar dus geldt de geboortejaar van vorig jaar
      yearsOld--;
    }

    return yearsOld;
  }
  /**
   * Calculate coming birth day
   * @param birthDate
   * @returns IBirthDay
   */
  public static ComingBirthDay(birthDate: Date): IBirthDay {

    let today = new Date();
    let yy = today.getFullYear() + 1;
    let mm = today.getMonth() - birthDate.getMonth();
    let age = yy - birthDate.getFullYear();
    if (mm < 0 || (mm === 0 && today.getDate() <= birthDate.getDate())) {
      age--;
      yy--;
    }
    let birthDay = new Date(yy, birthDate.getMonth(), birthDate.getDate());

    return { 'BirthDay': birthDay, 'Age': age }
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  public static LeeftijdCategorie(birthdate: Date): string {
    const yearsOld = this.BondsLeeftijd(birthdate);
    if (yearsOld <= LidTypeValues.MAXYOUTHAGE) {
      return 'Jeugd';
    } else {
      return 'Volwassenen';
    }
  }

  /***************************************************************************************************
  / Geeft 4 mogelijke resulaten terug:
  / JM = Jeugd Man, VV = Volwassen Vrouw, JV en VM
  /***************************************************************************************************/
  public static LeeftijdCategorieWithSex(lid: LedenItem): string {
    const yearsOld = this.BondsLeeftijd(new Date(lid.GeboorteDatum));
    if (yearsOld <= LidTypeValues.MAXYOUTHAGE && lid.Geslacht === LidTypeValues.MALE) {
      return LidTypeValues.YOUTH + LidTypeValues.MALE;
    }
    if (yearsOld <= LidTypeValues.MAXYOUTHAGE && lid.Geslacht === LidTypeValues.FEMALE) {
      return LidTypeValues.YOUTH + LidTypeValues.FEMALE;
    }
    if (yearsOld > LidTypeValues.MAXYOUTHAGE && lid.Geslacht === LidTypeValues.MALE) {
      return LidTypeValues.ADULT + LidTypeValues.MALE;
    }
    if (yearsOld > LidTypeValues.MAXYOUTHAGE && lid.Geslacht === LidTypeValues.FEMALE) {
      return LidTypeValues.ADULT + LidTypeValues.FEMALE;
    }
    return LidTypeValues.ADULT + LidTypeValues.MALE; 
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  public static LeeftijdCategorieBond(birthdate: Date): string {
    const yearsOld = this.BondsLeeftijd(birthdate);
    if (yearsOld <= 6) { return 'Onder11/-2'; }
    if (yearsOld === 7) { return 'Onder11/-1'; }
    if (yearsOld === 8) { return 'Onder11/0'; }
    if (yearsOld === 9) { return 'Onder11/1'; }
    if (yearsOld === 10) { return 'Onder11/2'; }
    if (yearsOld === 11) { return 'Onder13/1'; }
    if (yearsOld === 12) { return 'Onder13/2'; }
    if (yearsOld === 13) { return 'Onder15/1'; }
    if (yearsOld === 14) { return 'Onder15/2'; }
    if (yearsOld === 15) { return 'Onder17/1'; }
    if (yearsOld === 16) { return 'Onder17/2'; }
    if (yearsOld === 17) { return 'Onder19/1'; }
    if (yearsOld === 18) { return 'Onder19/2'; }
    if (yearsOld === 19) { return 'Senior1/O23'; }
    if (yearsOld === 20) { return 'Senior/O23'; }
    if (yearsOld === 21) { return 'Senior/O23'; }
    if (yearsOld === 22) { return 'Senior/O23'; }
    if (yearsOld >= 65) { return '65-Plus'; }
    return 'Senior';
  }

  public static InnerHtmlLabelLeeftijdsCategorie(leeftijdsCategorie: string) {
    switch (leeftijdsCategorie) {
      case 'Onder11/-2': return 'Onder 11 <sup>-2</sup>';
      case 'Onder11/-1': return 'Onder 11 <sup>-1</sup>';
      case 'Onder11/0': return 'Onder 11 <sup>0</sup>';
      case 'Onder11/1': return 'Onder 11 <sup>1</sup>';
      case 'Onder11/2': return 'Onder 11 <sup>2</sup>';
      case 'Onder13/1': return 'Onder 13 <sup>1</sup>';
      case 'Onder13/2': return 'Onder 13 <sup>2</sup>';
      case 'Onder15/1': return 'Onder 15 <sup>1</sup>';
      case 'Onder15/2': return 'Onder 15 <sup>2</sup>';
      case 'Onder17/1': return 'Onder 17 <sup>1</sup>';
      case 'Onder17/2': return 'Onder 17 <sup>2</sup>';
      case 'Onder19/1': return 'Onder 19 <sup>1</sup>';
      case 'Onder19/2': return 'Onder 19 <sup>2</sup>';
      case 'Senior1/O23': return 'Senior/O23 <sup>1</sup>';
      case 'Senior/O23': return 'Senior/O23';
      case 'Senior': return 'Senior';
      case '65-Plus': return '65-Plus';
    }
    return '';
  }

  /**
   * Calculate coming birth day
   * @param memberSince
   * @returns IBirthDay
   */
  public static ComingAnniversary(memberSince: Date): IBirthDay {
    const jubilea: Array<number> = [50, 40, 25, 10];

    let today = new Date();
    let endThisYear: Date = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    for (let index = 0; index < jubilea.length; index++) {
      const element = jubilea[index];
      let anniversaryDay: Date = this.CalculateAnniversary(memberSince, element);
      if (anniversaryDay >= today && anniversaryDay < endThisYear) {
        return { 'BirthDay': anniversaryDay, 'Age': element }
      }

    }
          return { 'BirthDay': new Date("1900-01-01"), 'Age': 0 }
  }

  private static CalculateAnniversary(memberSince: Date, years: number): Date {
    let yy = memberSince.getFullYear() + years;
    let mm = memberSince.getMonth();
    let dd = memberSince.getDate();
    return new Date(yy, mm, dd);
  }

}


export interface IBirthDay {
  BirthDay: Date,
  Age: Number
}

