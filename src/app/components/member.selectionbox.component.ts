import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, Output, EventEmitter, TemplateRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DateRoutines, LedenItemExt } from 'src/app/services/leden.service';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-member-selection-box',
  template: `
  <small class="development" *ngIf="developmentMode">{{ me }}</small><div>
  <ng-container *ngTemplateOutlet="selectionTemplate;"></ng-container>
  <mat-card>
    <mat-card-header>
      <mat-card-title>Leden</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <table mat-table #table [dataSource]="dataSource">

        <ng-container matColumnDef="Naam">
          <th mat-header-cell *matHeaderCellDef> Naam </th>
          <td mat-cell *matCellDef="let element"> {{ element.Naam }} </td>
        </ng-container>
        <ng-container matColumnDef="Leeftijd">
          <th mat-header-cell *matHeaderCellDef class='lastcolumnshrink'>
            <div class="mat-cell">
              <strong>Leeftijd</strong>

            </div>
            <mat-form-field class="filter" floatLabel="never" style="width:60px">
              <mat-label>Zoek</mat-label>
              <input matInput id="zoek2" [formControl]="ageFilter">
            </mat-form-field>
          </th>
          <td mat-cell *matCellDef="let element" class='lastcolumnshrink'><div [innerHTML]="InnerHtmlLabelLeeftijdsCategorie(element.LeeftijdCategorieBond)"></div></td>
        </ng-container>

        <!-- Checkbox Column -->
        <ng-container matColumnDef="actions1">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox (change)="$event ? masterToggle() : null"
              color="primary"
              [checked]="selection.hasValue() && isAllSelected()"
              [indeterminate]="selection.hasValue() && !isAllSelected()"
              [aria-label]="checkboxLabel()">
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let element" class="cell-padding">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="onCheckboxChange($event, element)"
              color='primary'
              [checked]="selection.isSelected(element)"
              [aria-label]="checkboxLabel(element)">
            </mat-checkbox>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="onCheckboxChange($event, row)">
        </tr>

      </table>
    </mat-card-content>
  </mat-card>

`,
  styles: []
})

export class MemberSelectionBoxComponent extends BaseComponent implements OnInit, OnChanges {

  @Input()
  ledenLijst: Array<LedenItemExt> = [];

  @Input()
  selectionTemplate!: TemplateRef<any>;

  @Output()
  selectedMemberList = new EventEmitter<Event>();

  selection = new SelectionModel<LedenItemExt>(true, []); //used for checkboxes
  displayedColumns: string[] = ['actions1', 'Naam', 'Leeftijd'];
  ageFilter = new UntypedFormControl('');
  filterValues = {
    Leeftijd: '',
  };
  dataSource = new MatTableDataSource<LedenItemExt>();


  ngOnInit(): void {
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
  }

  /***************************************************************************************************
  / De selection of the memberlist has changed in the parent component.
  /***************************************************************************************************/
  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.ledenLijst;
    this.dataSource.filterPredicate = this.createFilter();
  }

  /***************************************************************************************************
  / Whether the number of selected elements matches the total number of rows.
  /***************************************************************************************************/
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /***************************************************************************************************
  / Selects all rows if they are not all selected; otherwise clear selection.
  /***************************************************************************************************/
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.emitSelected();
      return;
    }
    this.selection.select(...this.dataSource.filteredData);
    this.emitSelected();
  }

  /***************************************************************************************************
  / The label for the checkbox on the passed row. Voor als de regel wordt geklikt
  /***************************************************************************************************/
  checkboxLabel(row?: LedenItemExt): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.LidNr}`;
  }

  /***************************************************************************************************
  / Een checkbox van de ledenlijst is gewijzigd.
  /***************************************************************************************************/
  onCheckboxChange($event: any, row:any): void {
    if ($event) {
      this.selection.toggle(row);
    }
    this.emitSelected();
  }

  /***************************************************************************************************
  / Geef de nieuwe selectie door aan de parent componennt
  /***************************************************************************************************/
  emitSelected(): void {
    this.selectedMemberList.emit(this.selection.selected as any);
  }


  InnerHtmlLabelLeeftijdsCategorie(value: string): string {
    return DateRoutines.InnerHtmlLabelLeeftijdsCategorie(value);
  }

  /***************************************************************************************************
  /  Deze filter wordt bij initialisatie geinitieerd
  /***************************************************************************************************/
  private createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      return data.LeeftijdCategorieBond.toString().toLowerCase().indexOf(searchTerms.Leeftijd.toLowerCase()) !== -1
    }
    return filterFunction;
  }
}
