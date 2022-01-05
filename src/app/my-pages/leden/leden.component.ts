import { Component, OnInit } from '@angular/core';
import { LedenService, LedenItem, LidTypeValues, LedenItemExt, DateRoutines } from '../../services/leden.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CountingValues } from 'src/app/shared/modules/CountingValues';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ParentComponent } from 'src/app/shared/parent.component';
import { Clipboard } from '@angular/cdk/clipboard';
@Component({
  selector: 'app-leden',
  templateUrl: './leden.component.html',
  styleUrls: ['./leden.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class LedenComponent extends ParentComponent implements OnInit {

  constructor(
    protected snackBar: MatSnackBar,
    protected ledenService: LedenService,
    private clipboard: Clipboard) {
    super(snackBar)
  }

  dataSource = new MatTableDataSource();
  public ledenDataArray: LedenItem[] = [];
  public ledenDataArrayNieuw: LedenItem[] = [];
  public ledenDataArrayOpgezegd: LedenItem[] = [];
  public ledenDataArrayFotoVerbod: any[] = [];
  public columnsToDisplay: string[] = ['Naam', 'Leeftijd'];
  public columnsToDisplayPhoto: string[] = ['Naam', 'Groep'];
  public categories = new CountingValues([]);
  public expandedElement: LedenItemExt; // added on the angular 8 upgrade to suppres error message


  nameFilter = new FormControl('');
  ageFilter = new FormControl('');
  filterValues = {
    Naam: '',
    Leeftijd: '',
  };

  ngOnInit(): void {

    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe({
          next: (data) => {
            this.dataSource.data = data;
            this.dataSource.filterPredicate = this.createFilter();
            this.ledenDataArray = data;
            data.forEach((lid) => {
              this.categories.Increment(lid.LeeftijdCategorieBond);
              this.categories.Increment(lid.LeeftijdCategorie);
              this.categories.Increment(lid.LeeftijdCategorieWithSex);
              this.categories.Increment('Totaal');
              if (lid.MagNietOpFoto == '1')
                this.ledenDataArrayFotoVerbod.push({ VolledigeNaam: lid.VolledigeNaam, LeeftijdCategorie: lid.LeeftijdCategorie });
            });
          }
        })
    );

    /***************************************************************************************************
    / Er is een key ingetypt op de naam categorie filter: aboneer op de filter
    /***************************************************************************************************/
    this.registerSubscription(
      this.nameFilter.valueChanges
        .subscribe({
          next: name => {
            this.filterValues.Naam = name;
            this.dataSource.filter = JSON.stringify(this.filterValues);
          }
        })
    );

    /***************************************************************************************************
    / Er is een key ingetypt op de leeftijd categorie filter
    /***************************************************************************************************/
    this.registerSubscription(
      this.ageFilter.valueChanges
        .subscribe({
          next: age => {
            this.filterValues.Leeftijd = age;
            this.dataSource.filter = JSON.stringify(this.filterValues);
          }
        })
    );

    /***************************************************************************************************
    / De laatste 5 nieuwe en de laatste 5 opzeggingen
    /***************************************************************************************************/
    this.registerSubscription(
      this.ledenService.getMutaties$()
        .subscribe({
          next: (data2: LedenItem[]) => {
            this.ledenDataArrayNieuw = data2.slice();  // copy by value
            this.ledenDataArrayOpgezegd = data2.slice();
            this.ledenDataArrayNieuw.splice(5, 5);
            this.ledenDataArrayOpgezegd.splice(0, 5);
          }
        })
    );
  }

  /***************************************************************************************************
  / Deze filter wordt bij initialisatie geinitieerd
  /***************************************************************************************************/
  private createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.Naam.toLowerCase().indexOf(searchTerms.Naam.toLowerCase()) !== -1
        && data.LeeftijdCategorieBond.toString().toLowerCase().indexOf(searchTerms.Leeftijd.toLowerCase()) !== -1
    }
    return filterFunction;
  }

  /***************************************************************************************************
  / Als er op een copy icon wordt gekikt dan wordt de waarde in het clipboard gezet
  /***************************************************************************************************/
  onClickCopy(field: string) {
    console.log('copied: ', field);
    this.clipboard.copy(field);
    this.showSnackBar('Copied: ' + field);
  }

  /***************************************************************************************************
  / HTML help functies
  /***************************************************************************************************/
  getLidType(value: string): string {
    return LidTypeValues.GetLabel(value);
  }

  getLidCategory(value: string): number {
    return this.categories.get(value);
  }

  InnerHtmlLabelLeeftijdsCategorie(value: string): string {
    return DateRoutines.InnerHtmlLabelLeeftijdsCategorie(value);
  }

}

// TODO: de boxen nieuwe leden, opgezegd en foto verbod moeten worden uitgelijnd

// <div *ngFor="let step of item.testSteps; let last = last;let odd = odd;">
//     <mat-list-item [ngClass]="{highlighted: odd}">
//     </mat-list-item>
// </div>

// In component CSS:

// .highlighted
// {
//      background-color: whitesmoke;
// }
