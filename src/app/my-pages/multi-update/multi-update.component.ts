import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { LedenService, LedenItem, LedenItemExt } from './../../services/leden.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';

@Component({
  selector: 'app-multi-update',
  templateUrl: './multi-update.component.html',
  styleUrls: ['./multi-update.component.scss']
})
export class MultiUpdateComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, {static: false}) table: MatTable<any>;

  displayedColumns: string[] = ['Naam', 'LidBond', 'CompGerechtigd', 'OldStars' ];
  dataSource = new MatTableDataSource<LedenItemExt2>();
  selection = new SelectionModel<LedenItem>(true, []); //used for checkboxes
  fabButtons = [];  // dit zijn de buttons op het scherm
  fabIcons = [{ icon: 'save' }];

  constructor(
    protected ledenService: LedenService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe({
          next: (data) => {
            this.dataSource.data = data;
          }
        })


        );
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  onCheckboxLidBondChange(event, row): void {
    row.LidBond = event.checked;
    row.Dirty = true;
  }

  onCheckboxCompGerechtigdChange(event, row): void {
    row.CompGerechtigd = event.checked;
    row.Dirty = true;
  }

  onCheckboxOldStarsChange(event, row): void {
    row.OldStars = event.checked;
    row.Dirty = true;
  }


  onFabClick(event, buttonNbr): void {
    try {
      this.dataSource.data.forEach(element => {
        if (element.Dirty) {
          element.Dirty = false;
          const updateRecord = {
            'LidNr': element.LidNr,
            'LidBond': element.LidBond,
            'CompGerechtigd': element.CompGerechtigd,
            'OldStars': element.OldStars
          };
          let sub = this.ledenService.update$(updateRecord)
            .subscribe();
          this.registerSubscription(sub);
        }
      });
      this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
    }
    catch (e) {
      this.showSnackBar(SnackbarTexts.UpdateError, '');
    }
  }
}

/***************************************************************************************************
/ Met dit veld controleren we of een rij is aangepast
/***************************************************************************************************/
class LedenItemExt2 extends LedenItemExt {
  Dirty?:boolean = false;
}
