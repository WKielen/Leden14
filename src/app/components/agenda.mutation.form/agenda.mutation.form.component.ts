import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { TypeValues, OrganisatieValues, DoelgroepValues, AgendaItem } from 'src/app/services/agenda.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { FormValueToDutchDateString } from 'src/app/shared/modules/DateRoutines';

@Component({
  selector: 'app-agenda-mutation-form',
  templateUrl: './agenda.mutation.form.component.html',
  styleUrls: ['./agenda.mutation.form.component.scss']
})
export class AgendaMutationFormComponent extends BaseComponent implements OnInit {

  agendaItemForm = new UntypedFormGroup({
    datum: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    tijd: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    evenementnaam: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    lokatie: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    type: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    doelgroep: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    toelichting: new UntypedFormControl(),
    inschrijven: new UntypedFormControl(),
    inschrijfgeld: new UntypedFormControl(),
    betaalmethode: new UntypedFormControl(),
    contactpersoon: new UntypedFormControl(),
    vervoer: new UntypedFormControl(),
    verzamelafspraak: new UntypedFormControl(),
    organisatie: new UntypedFormControl(
      '',
      [Validators.required]
    ),
  });

  typeValues = TypeValues.table;
  OrganisatieValues = OrganisatieValues.table;
  doelgroepValues = DoelgroepValues.table;

  @Input() public evenement: AgendaItem = {};

  @Output() public changedEvenement: EventEmitter<AgendaItem> = new EventEmitter<AgendaItem>();

  ngOnInit(): void {
    this.datum.setValue(this.evenement.Datum);
    this.tijd.setValue(this.evenement.Tijd);
    this.evenementnaam.setValue(this.evenement.EvenementNaam);
    this.lokatie.setValue(this.evenement.Lokatie);
    this.type.setValue(this.evenement.Type);
    this.doelgroep.setValue(this.evenement.DoelGroep);
    this.toelichting.setValue(this.evenement.Toelichting);
    this.inschrijven.setValue(this.evenement.Inschrijven);
    this.inschrijfgeld.setValue(this.evenement.Inschrijfgeld);
    this.betaalmethode.setValue(this.evenement.BetaalMethode);
    this.contactpersoon.setValue(this.evenement.ContactPersoon);
    this.vervoer.setValue(this.evenement.Vervoer);
    this.verzamelafspraak.setValue(this.evenement.VerzamelAfspraak);
    this.organisatie.setValue(this.evenement.Extra1);
  }


  /***************************************************************************************************
   / Sluit dialog
   /***************************************************************************************************/
  onSubmit(): void {
    this.evenement.Datum = FormValueToDutchDateString(this.datum.value);
    this.evenement.Tijd = this.tijd.value;
    this.evenement.EvenementNaam = this.evenementnaam.value;
    this.evenement.Lokatie = this.lokatie.value;
    this.evenement.Type = this.type.value;
    this.evenement.DoelGroep = this.doelgroep.value;
    this.evenement.Toelichting = this.toelichting.value;
    this.evenement.Inschrijven = this.inschrijven.value;
    this.evenement.Inschrijfgeld = this.inschrijfgeld.value;
    this.evenement.BetaalMethode = this.betaalmethode.value;
    this.evenement.ContactPersoon = this.contactpersoon.value;
    this.evenement.Vervoer = this.vervoer.value;
    this.evenement.VerzamelAfspraak = this.verzamelafspraak.value;
    this.evenement.Extra1 = this.organisatie.value;
    this.changedEvenement.emit(this.evenement);
  }


  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/

  get datum(): AbstractControl {
    return this.agendaItemForm.get('datum');
  }
  get tijd(): AbstractControl {
    return this.agendaItemForm.get('tijd');
  }
  get evenementnaam(): AbstractControl {
    return this.agendaItemForm.get('evenementnaam');
  }
  get lokatie(): AbstractControl {
    return this.agendaItemForm.get('lokatie');
  }
  get type(): AbstractControl {
    return this.agendaItemForm.get('type');
  }
  get doelgroep(): AbstractControl {
    return this.agendaItemForm.get('doelgroep');
  }
  get toelichting(): AbstractControl {
    return this.agendaItemForm.get('toelichting');
  }
  get inschrijven(): AbstractControl {
    return this.agendaItemForm.get('inschrijven');
  }
  get inschrijfgeld(): AbstractControl {
    return this.agendaItemForm.get('inschrijfgeld');
  }
  get betaalmethode(): AbstractControl {
    return this.agendaItemForm.get('betaalmethode');
  }
  get contactpersoon(): AbstractControl {
    return this.agendaItemForm.get('contactpersoon');
  }
  get vervoer(): AbstractControl {
    return this.agendaItemForm.get('vervoer');
  }
  get verzamelafspraak(): AbstractControl {
    return this.agendaItemForm.get('verzamelafspraak');
  }
  get organisatie(): AbstractControl {
    return this.agendaItemForm.get('organisatie');
  }

}
