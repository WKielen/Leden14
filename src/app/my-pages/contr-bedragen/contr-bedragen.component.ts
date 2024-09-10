import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { ContributieBedragen } from "src/app/shared/classes/ContributieBedragen";
import { ParentComponent } from 'src/app/shared/parent.component';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { ParamService } from 'src/app/services/param.service';

@Component({
  selector: 'app-contr-bedragen',
  templateUrl: './contr-bedragen.component.html',
  styleUrls: ['./contr-bedragen.component.scss']
})

export class ContrBedragenComponent extends ParentComponent implements OnInit {

  contributieBedragen: ContributieBedragen = null;
  ledenArray: LedenItemExt[] = null;
  tekstOpAfschrift: string = null;
  datumIncasso: string = null;
  extraMailText: string = null;
  
  constructor(
    protected paramService: ParamService,
    protected ledenService: LedenService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.readContributieBedragen();
    this.readActiveMembers();
    this.readMiscellaneousFields();
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  private readContributieBedragen(): void {
    this.registerSubscription(
      this.paramService.readParamData$("ContributieBedragen", JSON.stringify(new ContributieBedragen()), 'Contributie bedragen')
        .subscribe({
          next: (data) => {
            this.contributieBedragen = JSON.parse(data as string) as ContributieBedragen;
          },
          error: (error: AppError) => {
            console.log("error", error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Lees de leden waarvoor de contributie moet worden gemaakt. 'true' betekent dat ook de IBAN wordt ingelezen
  /***************************************************************************************************/
  private readActiveMembers(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$(true)
        .subscribe({
          next: (data) => {
            this.ledenArray = data;
          },
          error: (error: AppError) => {
            console.log("error", error);
          }
        })
    )
  }

  /***************************************************************************************************
  / Lees losse velden uit Param tabel
  /***************************************************************************************************/
  private readMiscellaneousFields() {

    //* Omschrijving op afschrift
    this.registerSubscription(
      this.paramService.readParamData$("TekstOpAfschrift", '', 'Extra contributie parameters')
        .subscribe({
          next: (data) => {
            this.tekstOpAfschrift = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        })
    )

    //* Gewenste incaso datum
    this.registerSubscription(
      this.paramService.readParamData$("DatumIncasso", '', '2021-01-01')
        .subscribe({
          next: (data) => {
            this.datumIncasso = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))

    this.registerSubscription(
      this.paramService.readParamData$("ExtraContributieMailTekst", '', 'Extra tekst op de contributie mail')
        .subscribe({
          next: (data) => {
            this.extraMailText = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / Als een bedrag wijzigt in het contributie bedragen component.
  /***************************************************************************************************/
  onContributieAmounts($event) {
    this.contributieBedragen = $event;
  }
}

