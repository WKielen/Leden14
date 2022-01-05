import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LedenItemExt } from 'src/app/services/leden.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-member-checkbox-table',
  templateUrl: './member.checkbox.table.component.html',
  styleUrls: ['./member.checkbox.table.component.scss']
})
export class MemberCheckboxTableComponent extends BaseComponent implements OnInit {

  @Input()
  public dataSource = new MatTableDataSource<LedenItemExt>();

  @Input()
  public checkboxHeader: string = 'Selecteer';

  @Input()
  public columns: Array<string> = ['Naam', 'Leeftijd'];
  
  public displayedColumns: string[];

  @Output()
  memberChecked: EventEmitter<LedenItemTableRow> = new EventEmitter();

  ngOnInit(): void {
    this.displayedColumns = [...this.columns, 'actions1'];
  }

  onRowClick(row): void {
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