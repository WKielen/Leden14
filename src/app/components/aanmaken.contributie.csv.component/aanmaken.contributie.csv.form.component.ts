import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParamService } from 'src/app/services/param.service';
import { ContributieBedragen } from 'src/app/shared/classes/ContributieBedragen';
import { DirectDebit } from 'src/app/shared/classes/DirectDebit';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { CreateBerekenOverzicht, CreateDirectDebits } from 'src/app/shared/modules/ContributieCalcFunctions';
import { ParentComponent } from 'src/app/shared/parent.component';
import { ExportToCsv } from 'export-to-csv';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';

@Component({
  selector: 'app-aanmaken-contributie-csv-form',
  templateUrl: './aanmaken.contributie.csv.form.component.html',
  styleUrls: ['./aanmaken.contributie.csv.form.component.scss']
})

export class AanmakenContributieCSVFormComponent extends ParentComponent implements OnInit {

  incassoForm = new UntypedFormGroup({
    Omschrijving: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    RequestedDirectDebitDate: new UntypedFormControl(
      '',
      [Validators.required]

    )

  });

  csvOptions = {
    fieldSeparator: ';',
    quoteStrings: '"',
    decimalSeparator: ',',
    showLabels: true,
    showTitle: false,
    title: 'Contributielijst',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    filename: ''
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
  };

  @Input() ledenArray: LedenItemExt[] = null;
  @Input() contributieBedragen = null;
  @Input() tekstOpAfschrift: string = null;
  @Input() datumIncasso: string = null;

  @Output() changedDatumIncasso: EventEmitter<string> = new EventEmitter<string>();
  @Output() changedTekstOpAfschrift: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    protected paramService: ParamService,
    protected ledenService: LedenService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    if (!this.ledenArray)
      this.readActiveMembers();
    if (!this.contributieBedragen)
      this.readContributieBedragen();
    if (!this.tekstOpAfschrift)
      this.readTekstOpAfschrift();
    else
      this.Omschrijving.setValue(this.tekstOpAfschrift);
    if (!this.datumIncasso)
      this.readDatumIncasso();
    else
      this.RequestedDirectDebitDate.setValue(this.datumIncasso);
  }

  /***************************************************************************************************
  / Maak een incasso bestand. Dit is een input bestand voor sepabestand.nl
  /***************************************************************************************************/
  onIncassoBestand(): void {
    let directDebits: DirectDebit[] = CreateDirectDebits(this.ledenArray, this.contributieBedragen, this.Omschrijving.value)
    this.csvOptions.filename = "TTVN Incasso " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(directDebits);
  }

  /***************************************************************************************************
  / Maak een bestand om de rekeningen te maken voor de zelfbetalers
  /***************************************************************************************************/
  onRekeningBestand(): void {
    let berekeningOverzichten = CreateBerekenOverzicht(this.ledenArray, this.contributieBedragen, 'R', this.Omschrijving.value);
    this.csvOptions.filename = "TTVN Rekeningen " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(berekeningOverzichten);
  }

  /***************************************************************************************************
  / Maak een bestand om de rekeningen te maken voor de UPAS en Nieuwegeinpas houders.
  /***************************************************************************************************/
  onAndersBetalenden(): void {
    let berekeningOverzichten = CreateBerekenOverzicht(this.ledenArray, this.contributieBedragen, 'U', this.Omschrijving.value);
    this.csvOptions.filename = "TTVN Nieuwegeinpas " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(berekeningOverzichten);
  }

  /***************************************************************************************************
  / Maak een overzicht van alle gegevens die zijn gebruikt bij het berekenen van de contributie
  /***************************************************************************************************/
  onBerekeningOverzicht(): void {
    let berekeningOverzichten = CreateBerekenOverzicht(this.ledenArray, this.contributieBedragen, '', this.Omschrijving.value);
    console.log("AanmakenContributieCSVFormComponent --> onBerekeningOverzicht --> berekeningOverzichten", berekeningOverzichten);
    this.csvOptions.filename = "TTVN Overzicht berekeningen " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(berekeningOverzichten);
  }

  /***************************************************************************************************
  / Lees de leden waarvoor de contributie moet worden gemaakt. 'true' betekent dat ook de IBAN wordt ingelezen
  /***************************************************************************************************/
  readActiveMembers(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$(true)
        .subscribe({
          next: (data) => {
            this.ledenArray = data;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  readContributieBedragen(): void {
    this.registerSubscription(
      this.paramService.readParamData$("ContributieBedragen", JSON.stringify(new ContributieBedragen()), 'Contributie bedragen')
        .subscribe({
          next: (data) => {
            this.contributieBedragen = JSON.parse(data as string) as ContributieBedragen;
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        })
    );
  }

  /***************************************************************************************************
  / Lees de extra param uit de Param tabel
  / - Omschrijving op afschrift
  /***************************************************************************************************/
  readTekstOpAfschrift(): void {
    this.registerSubscription(
      this.paramService.readParamData$("TekstOpAfschrift", '', 'Extra contributie parameters')
        .subscribe({
          next: (data) => {
            this.tekstOpAfschrift = data as string;
            this.Omschrijving.setValue(this.tekstOpAfschrift);
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        })
    )
  }

  /***************************************************************************************************
  / Lees de extra param uit de Param tabel
  / - Omschrijving op afschrift
  /***************************************************************************************************/
  readDatumIncasso(): void {
    this.registerSubscription(
      this.paramService.readParamData$("DatumIncasso", '2021-01-01', "Datum waarop de incasso moet plaatsvinden")
        .subscribe({
          next: (data) => {
            this.RequestedDirectDebitDate.setValue(data);
          },
          error: (error: AppError) => {
            console.error("error", error);
          }
        }))
  }

  /***************************************************************************************************
  / De tekst rekeningafschrift is gewijzigd
  /***************************************************************************************************/
  onSaveChangedFields(): void {
    this.registerSubscription(
      this.paramService.saveParamData$("TekstOpAfschrift", this.Omschrijving.value, 'Contributie Najaar 202.')
        .subscribe({
          next: (data) => {
            this.tekstOpAfschrift = data as string;
            this.changedTekstOpAfschrift.emit(this.tekstOpAfschrift);
          },
          error: (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
            } else { throw error; }
          }
        }))
  }

  /***************************************************************************************************
  / 
  /***************************************************************************************************/
  onSaveChangedDate($event): void {
    this.registerSubscription(
      this.paramService.saveParamData$("DatumIncasso", $event.value.format('YYYY-MM-DD'), '2021-01-01')
        .subscribe({
          next: (data) => {
            this.datumIncasso = data as string;
            this.changedDatumIncasso.emit(this.datumIncasso);
          },
          error: (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
            } else { throw error; }
          }
        }))
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get Omschrijving(): AbstractControl {
    return this.incassoForm.get('Omschrijving');
  }
  get RequestedDirectDebitDate(): AbstractControl {
    return this.incassoForm.get('RequestedDirectDebitDate');
  }

}
