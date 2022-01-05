import { Component, OnInit, ViewChild } from '@angular/core';
import { ParamService, ParamItem } from 'src/app/services/param.service';
import { Ladder, LadderItem } from 'src/app/shared/classes/JeugdLadder';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { SelectionModel } from '@angular/cdk/collections';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';

@Component({
  selector: 'app-ladder',
  templateUrl: './ladder.component.html',
  styleUrls: ['./ladder.component.scss']
})

export class LadderComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  displayedColumns: string[] = ['Name', 'Points', 'Step'];
  dataSource = new MatTableDataSource<LadderItem>();
  selection = new SelectionModel<LadderItem>(true, []); //used for checkboxes
  fabButtons = [];  // dit zijn de buttons op het scherm
  fabIcons = [{ icon: 'save' }, { icon: 'add' }, { icon: 'sort_by_alpha' }];
  titleOfLadderPage: string = '';

  constructor(private paramService: ParamService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.readLadderItem();
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  /***************************************************************************************************
  / Lees het record uit de Param tabel
  /***************************************************************************************************/
  readLadderItem(): void {
    let sub = this.paramService.readParamData$("ladderstand", JSON.stringify(new Ladder()), "Stand van de ladder")
      .subscribe({
        next: (data) => {
          let result = data as string;
          // this.dataSource.data = this.createDummyData().LadderItems;
          let tmp: Ladder = JSON.parse(result);
          this.dataSource.data = tmp.LadderItems;
          this.titleOfLadderPage = tmp.StandPer;
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Er is een fab gedrukt
  /***************************************************************************************************/
  onFabClick(event, buttonNbr): void {

    switch (event.srcElement.innerText) {
      case 'save':
        this.onSave();
        break;
      case 'add':
        this.onAdd();
        break;
      case 'sort_by_alpha':
        this.onSort();
        break;
    }
  }

  /***************************************************************************************************
  / Add a new line to the table
  /***************************************************************************************************/
  onAdd(): void {
    let item = new LadderItem();
    this.dataSource.data.push(item);
    this.table.renderRows();
  }

  /***************************************************************************************************
  / Save the table
  /***************************************************************************************************/
  onSave(): void {
    // first remove empty rows
    for (let i = this.dataSource.data.length - 1; i >= 0; i--) {
      if (this.dataSource.data[i].Name == '') {
        this.dataSource.data.splice(i, 1);
      }
    }
    this.table.renderRows();

    // put the content in Value of a param and save the param
    let ladder = new Ladder();
    ladder.StandPer = this.titleOfLadderPage;

    this.dataSource.data.forEach(element => {
      let item = new LadderItem();
      item.Name = element.Name;
      item.Points = element.Points;
      item.Step = element.Step
      ladder.LadderItems.push(item);
    });

    let param = new ParamItem();
    param.Id = 'ladderstand';
    param.Description = 'Stand van de ladder';
    param.Value = JSON.stringify(ladder);

    let sub = this.paramService.saveParamData$(param.Id, param.Value, param.Description)
      .subscribe({
        next: (data) => {
          this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
        },
        error: (error: AppError) => {
          if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          } else { throw error; }
        }
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / De SORT fab
  /***************************************************************************************************/
  onSort(): void {
    this.dataSource.data.sort((item1, item2) => {
      if (item1.Points < item2.Points) { return 1; }
      if (item1.Points > item2.Points) { return -1; }
      return 0;
    });

    this.table.renderRows();
  }
}
