import { Attribute, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActionItem, ActionService, ACTIONSTATUS } from 'src/app/services/action.service';
import { ROLES } from 'src/app/services/website.service';
import { IHoldableResponse } from 'src/app/shared/directives/holdable.directive';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { DecisionDetailDialogComponent } from '../decision.detail.dialog.component/decision.detail.dialog';
import { DecisionMutationDialogComponent } from '../decision.mutation.dialog/decision.mutation.dialog';

@Component({
  selector: 'app-decision-maintenance-form',
  templateUrl: './decision.maintenance.card.component.html',
  styleUrls: ['./decision.maintenance.card.component.scss']
})

export class DecisionMaintenanceCardComponent extends ParentComponent implements OnInit {

  @Input() amIBestuur: boolean = true;
  @Input() firstNameFilter: string = null;
  
  @Output() updateAction: EventEmitter<any> = new EventEmitter<any>();
  
  public dataSource = new MatTableDataSource<ActionItem>();
  private filterValues = { Voornaam: '', ShowOnlyBestuur: false, Status: '' };
  public columnsToDisplay: string[] = ['Id', 'Title', 'StartDate', 'actions2'];
  
  // for the header
  public actionSpinner = 0;
  public firstSliderHeaderText: string = "";
  
  public theBoundCallback: Function;

  
  /***************************************************************************************************
  //* @Atttributie decorator
  / - Is een 'eenvoudige' versie van @Input
  / - Kan alleen een literal 'ontvangen' in de parent. Dus geen variable.
  / - Kan niet worden geinitialiseerd in de declaratie.
  / - Enige voordeel is dat de variable niet wordt meegenomen in Change Detection
  /***************************************************************************************************/
  
  
  constructor(
    @Attribute('hideAddButton') public hideAddButton: boolean,
    @Attribute('cardHeaderText') public cardHeaderText: string,
    @Attribute('filterStatus') public filterStatus: string,
    @Attribute('statusAfterFinished') public statusAfterFinished: string,
    public actionService: ActionService,
    protected snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    super(snackBar)
  }
  
  ngOnInit(): void {
    this.actionService.actionStream.subscribe({
      next: (data) => {
        if (data) {
          this.dataSource.data = data;
          this.refreshFilters();
        }
      }
    }
    )

    this.createFilters();
    if (this.amIBestuur) {
      this.firstSliderHeaderText = "Alleen bestuur"
    }
    this.filterValues.Status = this.filterStatus;
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }
 
  /***************************************************************************************************
  / Add Knop
  /***************************************************************************************************/
  onAddAction(): void {
    const toBeAdded = new ActionItem();
    toBeAdded.StartDate = new Date().to_YYYY_MM_DD();
    toBeAdded.TargetDate = new Date().to_YYYY_MM_DD();
    toBeAdded.Status = this.filterStatus;

    this.dialog.open(DecisionMutationDialogComponent, {
      data: { 'method': 'Toevoegen', 'data': toBeAdded },
      disableClose: true
    })
      .afterClosed()
      .subscribe({
        next: (data) => {
          if (data) {
            console.log('data', data, toBeAdded);
            this.updateAction.emit({ 'status': this.filterStatus, 'action': 'Add', 'data': data });
          }
        },
      });
  }


  /***************************************************************************************************
   / Done Knop
   /***************************************************************************************************/
  onDoneAction($event: IHoldableResponse, index: number): void {
    this.handleSpinner($event, index, this.cbDoneAction);
  }

  cbDoneAction(isDone: ActionItem): void {
    isDone.Status = this.statusAfterFinished;
    isDone.EndDate = (new Date()).to_YYYY_MM_DD();
    this.updateAction.emit({ 'status': this.filterStatus, 'action': 'Done', 'data': isDone });
  }


  /***************************************************************************************************
  / Edit Knop
  /***************************************************************************************************/
  onEditAction(index: number): void {
    let toBeEdited: ActionItem = this.dataSource.filteredData[index];

    this.dialog.open(DecisionMutationDialogComponent, {
      width: '500px',
      data: {
        method: "Wijzigen",
        data: toBeEdited,
        amIBestuur: this.amIBestuur
      },
    })
      .afterClosed()
      .subscribe({
        next: (data) => {
          if (data) {
            console.log('data', data, toBeEdited);
            this.updateAction.emit({ 'status': this.filterStatus, 'action': 'Update', 'data': data });
          }
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
  }


  /***************************************************************************************************
  / Delete Knop
  / De actie zelf gaat via het event uit de header onHoldAction
  /***************************************************************************************************/
  onDeleteAction($event: IHoldableResponse, index: number): void {
    this.handleSpinner($event, index, this.cbDeleteAction);
  }

  cbDeleteAction(toBeDeleted: ActionItem): void {
    toBeDeleted.Status = ACTIONSTATUS.ARCHIVED;
    this.updateAction.emit({ 'status': this.filterStatus, 'action': 'Delete', 'data': toBeDeleted });
  }


  /***************************************************************************************************
  / Dubbel Klik op regels geeft details
  /***************************************************************************************************/
  onDblclickAction($event, index: number): void {
    this.dialog.open(DecisionDetailDialogComponent, {
      width: '500px',
      data: {
        data: this.dataSource.filteredData[index],
      },
    })
  }


  /***************************************************************************************************
  / This filter is created at initialize of the page.
  /***************************************************************************************************/
  createFilters(): void {
    this.filterValues.Voornaam = '';
    this.dataSource.filterPredicate = this.createActionFilter();
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  private createActionFilter(): (data: ActionItem, filter: string) => boolean {
    let filterFunction = function (data: ActionItem, filter: string): boolean {
      let searchTerms = JSON.parse(filter);

      if (searchTerms.ShowOnlyBestuur && data.Role.indexOf(ROLES.BESTUUR) == -1) {
        return false;
      }
      return ((data.HolderName == searchTerms.Voornaam || searchTerms.Voornaam == '') && data.Status == searchTerms.Status);
    }
    return filterFunction;
  }

  refreshFilters(): void {
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  private handleSpinner($event: IHoldableResponse, index: number, cbFunction: any): void {
    this.actionSpinner = $event.HoldTime;
    if ($event.Status == 'start') {  // first time call
      this.setCallBackParameters(index, this.dataSource, cbFunction); // wordt 2x aangeroepen omdat na de callback de waarde weer op nul wordt gezet
    }
    if ($event.Status == 'early') {
      this.showSnackBar(SnackbarTexts.ReleasedToEarly);
    }
  }

  triggerCallback: boolean = false;
  setCallBackParameters(index: number, dataSource: MatTableDataSource<ActionItem>, func) {
    const actionItem = dataSource.filteredData[index];
    this.theBoundCallback = func.bind(this, actionItem);
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  onFirstSliderChanged($event): void {
    this.filterValues.ShowOnlyBestuur = $event.checked;
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }
}