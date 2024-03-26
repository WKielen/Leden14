//<mat-checkbox-list [checkboxDictionary]="myDictionairy" (click)="onRoleClicked($event)"></mat-checkbox-list>
import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { BaseComponent } from '../shared/base.component';

// De html in de template wordt doorgegeven aan het child component. De events worden echter hier afgehandeld.

@Component({
  selector: 'app-member-selection-box-wrapper',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small><div>
  <ng-template #selectionWrapperTemplate>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Selectie</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-checkbox [(ngModel)]="ckbVolwassenen" (change)="onChangeckbVolwassenen($event)" color='primary'
          class='margin-right-20'>Volwassenen
        </mat-checkbox>
        <mat-checkbox [(ngModel)]="ckbJeugd" (change)="onChangeckbJeugd($event)" color='primary'>
          Jeugd</mat-checkbox>
      </mat-card-content>
    </mat-card>
  </ng-template>
  <app-member-selection-box [selectionTemplate]='selectionWrapperTemplate' [ledenLijst]='this.dataSource.filteredData' (selectedMemberList)="onSelectionChanged($event)"></app-member-selection-box>
`,
  styles: []
})
export class MemberSelectionBoxWrapperComponent extends BaseComponent implements OnInit {

  @Output()
  selectedMemberList = new EventEmitter<Event>();

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  ckbVolwassenen: boolean = true;
  ckbJeugd: boolean = true;
  dataSource: MatTableDataSource<LedenItemExt> = new MatTableDataSource();

  filterValues = {
    LeeftijdCategorieJ: '',
    LeeftijdCategorieV: '',
    LeeftijdCategorieS1: '',
  };

  constructor(
    protected ledenService: LedenService,
  ) {
    super();
  }


  ngOnInit(): void {

    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe({
          next: (data: Array<LedenItemExt>) => {
            this.dataSource.data = data;
          }
        }));

    this.dataSource.filterPredicate = this.createFilter();
    this.filterValues.LeeftijdCategorieV = 'volwassenen';
    this.filterValues.LeeftijdCategorieJ = 'jeugd';
    this.filterValues.LeeftijdCategorieS1 = 'Senior1/O23';

    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  /***************************************************************************************************
  / The selection has changed in the child component. We pass it through to the parent component
  /***************************************************************************************************/
  onSelectionChanged($event: any) {
    this.selectedMemberList.emit($event);
  }

  /***************************************************************************************************
  / De senioren zijn verwijderd uit de selectie omdat xxxxxxx geen categorie is
  /***************************************************************************************************/
  onChangeckbVolwassenen($event: any): void {
    this.filterValues.LeeftijdCategorieV = $event.checked ? 'volwassenen' : 'xxxxxxxxxxxxyz';
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  /***************************************************************************************************
  / De jeugd is verwijderd uit de selectie omdat xxxxxxx geen jeugdcategorie is
  /***************************************************************************************************/
  onChangeckbJeugd($event: any): void {
    this.filterValues.LeeftijdCategorieJ = $event.checked ? 'jeugd' : 'xxxxxxxxxxxxxxyz';
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  /***************************************************************************************************
  / This filter is created at initialize of the page.
  /***************************************************************************************************/
  private createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.LeeftijdCategorie.toLowerCase().indexOf(searchTerms.LeeftijdCategorieV) !== -1
        || data.LeeftijdCategorie.toLowerCase().indexOf(searchTerms.LeeftijdCategorieJ) !== -1
        || data.LeeftijdCategorieBond.indexOf(searchTerms.LeeftijdCategorieS1) !== -1  // deze is om Senior1 op beide lijsten te krijgen.
    }
    return filterFunction;
  }

}
