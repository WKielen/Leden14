import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { tap, map, retry, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class AgendaService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/agenda', http);
  }

  /***************************************************************************************************
  / Alle agenda items vanaf vandaag. Geeft alleen toernooien en competitie
  /***************************************************************************************************/
  getAllFromNow$(): Observable<Array<AgendaItem>> {
    return this.http.get(environment.baseUrl + '/agenda/getallfromnow')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        map(function (value) {
          let localdata = value as Array<any>
          localdata.forEach(element => {
            // TODO:  uit de PHP select halen. 
            delete element['ExtraA'];
            delete element['ExtraB'];
            delete element['DatumWijziging'];
          });
          return localdata;
        })
      );
  }

  /***************************************************************************************************
  / Alle agenda items voor komende week
  /***************************************************************************************************/
  nextWeek$() {
    return this.http.get(environment.baseUrl + '/agenda/komendeweek')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      );
  }

  /***************************************************************************************************
    // De ExtraA en ExtraB moeten uit de SQL tabel zelf worden verwijderd. Zodra dit is gebeurd kan deze override worden verwijderd.
  /***************************************************************************************************/
  update$(element: any): Observable<Object> {
    // TODO:  uit de PHP select halen. en dan deze method verwijderen
    delete element['ExtraA'];
    delete element['ExtraB'];
    delete element['DatumWijziging'];
    return super.update$(element);
  }


  /***************************************************************************************************
  / Get an agenda item
  /***************************************************************************************************/
  get$(Id: number): Observable<any> {
    return this.http.get(environment.baseUrl + '/agenda/get?Id=' + Id)
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }))
  }

}

/***************************************************************************************************
/
/***************************************************************************************************/
export class AgendaItem {
  Id?: string = '';
  Datum?: string = '';
  Tijd?: string = '';
  EvenementNaam?: string = '';
  Lokatie?: string = '';
  Type?: string = '';
  DoelGroep?: string = '';
  Toelichting?: string = '';
  Inschrijven?: string = '';
  Inschrijfgeld?: string = '';
  BetaalMethode?: string = '';
  ContactPersoon?: string = '';
  Vervoer?: string = '';
  VerzamelAfspraak?: string = '';
  Extra1?: string = '';
  Extra2?: string = '';
}

/***************************************************************************************************
/
/***************************************************************************************************/
export class OrganisatieValues {
  public static table: any[] = [
    { Value: '0', Label: 'NTTB' },
    { Value: '1', Label: 'Midden' },
    { Value: '2', Label: 'TTVN' },
    { Value: '3', Label: 'Overig' },
  ];
  // getracht onderstaand met Enums op te lossen.
  // wordt lastig als je in de template en dropdown wil maken met *ngFor
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
export class DoelgroepValues {
  public static table: any[] = [
    { Value: 'S', Label: 'Senioren' },
    { Value: 'J', Label: 'Jeugd' },
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
export class TypeValues {
  public static Action: string = "A";
  public static Toernooi: string = "T";
  public static Competitie: string = "C";
  public static Vergadering: string = "V";
  public static Activiteit: string = "H";
  public static Bestuursactiviteit: string = "B";
  public static ActieStartDatum: string = "S";
  public static ActieUitersteDatum: string = "E";

  public static table: any[] = [
    { Value: TypeValues.Toernooi, Label: 'Toernooi' },
    { Value: TypeValues.Competitie, Label: 'Competitie' },
    { Value: TypeValues.Vergadering, Label: 'Vergadering' },
    { Value: TypeValues.Activiteit, Label: 'Activiteit' },
    { Value: TypeValues.Bestuursactiviteit, Label: 'Bestuursactiviteit' },
    { Value: TypeValues.ActieStartDatum, Label: 'Actie start datum' },
    { Value: TypeValues.ActieUitersteDatum, Label: 'Actie uiterste datum' }
  ];
  public static GetLabel(value: string): string {
    if (!value) {
      return '';
    }
    if (value == TypeValues.Action)
      return 'Actie';
    return this.table.find(x => x.Value === value).Label;
  }



}
