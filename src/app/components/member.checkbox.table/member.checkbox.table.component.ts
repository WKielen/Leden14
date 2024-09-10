import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS as MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/legacy-checkbox';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { LedenItemExt } from 'src/app/services/leden.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-member-checkbox-table',
  templateUrl: './member.checkbox.table.component.html',
  styleUrls: ['./member.checkbox.table.component.scss'],
  providers: [
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } }   // veranderd het click gedrag van (alle) checkboxen. Zie material docs
  ],

})
export class MemberCheckboxTableComponent extends BaseComponent implements OnInit {

  @Input() public dataSource = new MatTableDataSource<LedenItemExt>();
  @Input() public checkboxHeader: string = 'Selecteer';
  @Input() public columns: Array<string> = ['Naam', 'Leeftijd'];
    
  @Output() public memberChecked: EventEmitter<LedenItemTableRow> = new EventEmitter();
  
  public displayedColumns: string[];
  
  ngOnInit(): void {
    this.displayedColumns = [...this.columns, 'actions1'];
  }

  onRowClick(row: any): void {
    row.Checked = !row.Checked;
    this.memberChecked.emit(row);
  }
}

/***************************************************************************************************
/ Extra velden voor iedere lidregel om de checkbox te besturen.
/***************************************************************************************************/
class LedenItemTableRow extends LedenItemExt {
  Checked: boolean;
}