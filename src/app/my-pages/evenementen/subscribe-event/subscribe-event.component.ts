import { Component, OnInit } from "@angular/core";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { ParentComponent } from "src/app/shared/parent.component";
import { ActivatedRoute } from '@angular/router';
import { AppError } from "src/app/shared/error-handling/app-error";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { InschrijvingItem, InschrijvingService } from "src/app/services/inschrijving.service";
import { SnackbarTexts } from "src/app/shared/error-handling/SnackbarTexts";
import { DuplicateKeyError } from "src/app/shared/error-handling/duplicate-key-error";
import { NoChangesMadeError } from "src/app/shared/error-handling/no-changes-made-error";
import { LedenItem, LedenItemExt, LedenService } from "src/app/services/leden.service";

@Component({
  selector: "app-test",
  templateUrl: "./subscribe-event.component.html",
  styleUrls: ["./subscribe-event.component.scss"],
})
export class SubscribeEventPageComponent
  extends ParentComponent implements OnInit {

  public agendaItem: AgendaItem = new AgendaItem();
  public ledenItem: LedenItem = new LedenItem();
  private agenda_Id: number = 0;
  private lidnr: number = 0;
  public responseText: string = '';
  public responseError: boolean = false;
  public showSubmitButton: string = 'block';

  subscribeForm = new UntypedFormGroup({
    naam: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    email: new UntypedFormControl(),
    extrainformatie: new UntypedFormControl(),
  });

  constructor(
    protected snackBar: MatSnackBar,
    protected agendaService: AgendaService,
    protected ledenService: LedenService,
    protected inschrijvingService: InschrijvingService,
    private route: ActivatedRoute,
  ) {
    super(snackBar);
  }

  /***************************************************************************************************
  / Lees evenement param van de URL in en lees vervolgens het record uit de tabel
  /***************************************************************************************************/
  ngOnInit() {
    this.registerSubscription(
      this.route.queryParams
        .subscribe(params => {
          if (params.hasOwnProperty('evenement')) {
            if (params['evenement'] != undefined) {
              try {
                this.agenda_Id = JSON.parse(atob(params['evenement']))['evenement'];
                this.lidnr = JSON.parse(atob(params['evenement']))['lidnr'];
              }
              catch (error) {
                this.responseText = 'Je evenement is niet gevonden.';

                console.log("Input error: ", error);
              }

              this.registerSubscription(
                this.agendaService.get$(this.agenda_Id)
                  .subscribe({
                    next: (data: AgendaItem) => {
                      this.agendaItem = data
                    },
                    error: (error: AppError) => {
                      console.log("error", error);
                    }
                  }
                  )
              );

              if (this.lidnr != undefined) {
                this.registerSubscription(
                  this.ledenService.getname$(this.lidnr)
                    .subscribe({
                      next: (data: LedenItemExt) => {
                        this.naam.setValue(data.VolledigeNaam);
                        this.email.setValue(data.Email1);
                      },
                      error: (error: AppError) => {
                        console.log("error", error);
                      }
                    }
                    )
                );
              }
            }
          }
        }
        )
    );
  }

  onSubmit() {
    let inschrijvingitem: InschrijvingItem = new InschrijvingItem();
    inschrijvingitem.Email = this.email.value ?? "";
    inschrijvingitem.Naam = this.naam.value ?? "" ;
    inschrijvingitem.ExtraInformatie = this.extrainformatie.value ?? "";
    inschrijvingitem.LidNr = this.lidnr ?? 0;
    inschrijvingitem.Agenda_Id = this.agenda_Id;
    this.showSubmitButton = 'none';

    this.registerSubscription(
      this.inschrijvingService.register$(inschrijvingitem)
        .subscribe({
          next: (addResult) => {
            this.responseText = 'Je inschrijving is geregistreerd!';
          },
          error: (error) => {
            this.responseError = true;
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey);
            } else if (error instanceof NoChangesMadeError) {
              this.responseText = 'Je inschrijving is niet geregistreerd.';
            } else {
              this.responseText = 'Er is een onbekende fout opgetreden :o(';
            }
          }
        })
    ) //register
  }


  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/

  get naam() {
    return this.subscribeForm.get('naam');
  }
  get email() {
    return this.subscribeForm.get('email');
  }

  get extrainformatie() {
    return this.subscribeForm.get('extrainformatie');
  }
}
