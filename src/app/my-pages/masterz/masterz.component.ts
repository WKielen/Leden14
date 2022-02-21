import { Component, OnInit } from '@angular/core';
import { LedenItem, LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { ParentComponent } from 'src/app/shared/parent.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { MatTableDataSource } from '@angular/material/table';
import { ParamService } from 'src/app/services/param.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-masterz',
  templateUrl: './masterz.component.html',
  styleUrls: ['./masterz.component.scss'],
})

export class MasterzComponent extends ParentComponent implements OnInit {
  public columns: Array<string> = ['Naam', 'Leeftijd'];
  public displayedColumns: string[] = ['Naam', 'Leeftijd', 'actions1',];
  public dataSource = new MatTableDataSource<LedenItemExt>();
  private geslaagden: Array<Number> = [];

  constructor(
    protected ledenService: LedenService,
    protected paramService: ParamService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    let subLeden = this.ledenService.getYouthMembers$()
      .pipe(
        map((data) => {
          return data.filter(isCompAndOlder12());
        }),
        catchError(err => of(new Array<LedenItemExt>()))
      );

    let subParam = this.paramService.readParamData$('Masterz', JSON.stringify(this.geslaagden), 'Geslaagden')
      .pipe(
        catchError(err => of(new Array<LedenItemExt>()))
      );

    this.registerSubscription(
      forkJoin([subLeden, subParam])
        .subscribe({
          next: (data) => {
            this.geslaagden = JSON.parse(data[1] as string);
            this.dataSource.data = this.mergeLedenAndDiploma(data[0] as Array<LedenItemExt>, this.geslaagden);
          },
          error: (error: AppError) => {
            console.error("EventSubscriptionsDialogComponent --> ngOnInit --> error", error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Merge ledenlist with Diplomalist
  /***************************************************************************************************/
  private mergeLedenAndDiploma(ledenList: Array<LedenItemExt>, geslaagden): Array<LedenItemExt> {
    ledenList.forEach(lid => {
      geslaagden.forEach(LidNr => {
        if (lid.LidNr == LidNr) {
          lid['Checked'] = true;
          return;
        }
      });
    });
    return ledenList;
  }

  /***************************************************************************************************
  / Save the Diploma for this day
  /***************************************************************************************************/
  public onSave(): void {
    this.geslaagden = [];
    this.dataSource.data.forEach(element => {
      if (element['Checked']) {
        this.geslaagden.push(element.LidNr);
      }
    });

    this.registerSubscription(this.paramService.saveParamData$('Masterz', JSON.stringify(this.geslaagden), 'geslaagden')
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
        },
        error: (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          }
          else if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          }
          else {
            this.showSnackBar(SnackbarTexts.UpdateError, '');
          }
        }
      })
    );
  }
}

function isCompAndOlder12() {
  return function (item: LedenItemExt) {
    if (item.Leeftijd <= 12 || item.CompGerechtigd == '0') return false
    return true;
  }
}


/*
Beste TTVN-er,

'Veilig sporten' is de speerpunten van het NOC/NSF (Nederlands Olympisch Comite). Bij 'Veilig sporten' kan je denken aan regels tegen pesten, ongewenste opmerkingen en aanrakingen. Naast deze zaken valt ook het spelen van wedstrijden onder 'Veilig sporten'. Hier moet je er aan denken dat het prettig is als je tegenstander volgens dezelfde spelregels speelt, als jij.
Om dit te bereiken, heeft het NOC/NSF bepaald dat alle jeugdsporten op de hoogte moeten zijn van de spelregels van hun sport. Dit geldt dus ook voor tafeltennissers.
Onze eigen bond, de Nationale Tafeltennisbond (NTTB), heeft bepaald dat alle jeugdspelers van 13 jaar en ouder moeten laten zien dat ze op de hoogte zijn van de spelregels. Ze hebben daarvoor een test gemaakt die je via een website kan invullen. Op website staan ook de belangrijkste spelregels en oefentoetsen.
Dus als je 13 of ouder bent en je gaat competitie spelen dan moet je deze test doen.

Het werkt als volgt:
1. Ga naar www.tafeltennismasterz.nl
2. Voer je bondsnummer in
3. Klik op  [Wachtwoord (opnieuw) instellen]
4. Je ontvangt een mail met bevestigingslink. Je ontvangt deze op het mailadres dat jij of je ouders aan TTVN hebt doorgegeven.
5. Klik op de link
6. Vervolgens wordt gevraagd om een wachtwoord (Zelf bedenken!)
7. Vul het wachtwoord twee keer in en bevestig
8. Je kunt inloggen met je bondsnummer en wachtwoord

Als je je bondsnummer of email niet meer weet, neem dan contact op met mij.



*/
