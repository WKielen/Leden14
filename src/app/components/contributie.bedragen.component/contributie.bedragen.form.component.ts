import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParamService } from 'src/app/services/param.service';
import { ContributieBedragen } from 'src/app/shared/classes/ContributieBedragen';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/parent.component';

@Component({
  selector: 'app-contributie-bedragen-form',
  templateUrl: './contributie.bedragen.form.component.html',
  styleUrls: ['./contributie.bedragen.form.component.scss']
})

export class ContributieBedragenFormComponent extends ParentComponent implements OnInit {

  contributieForm = new FormGroup({
    HalfjaarVolwassenen: new FormControl(
      '',
      [Validators.required]
    ),
    HalfjaarJeugd: new FormControl(
      '',
      [Validators.required]
    ),
    CompetitieBijdrageVolwassenen: new FormControl(
      '',
      [Validators.required]
    ),
    CompetitieBijdrageJeugd: new FormControl(
      '',
      [Validators.required]
    ),
    ZwerflidPercentage: new FormControl(
      '',
      [Validators.required]
    ),
    Donateur: new FormControl(
      '',
      [Validators.required]
    ),
    Pakket: new FormControl(
      '',
      [Validators.required]
    ),
  });

  constructor(
    protected paramService: ParamService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  @Input() public contributieBedragen: ContributieBedragen = null;

  @Output() public changedAmounts: EventEmitter<ContributieBedragen> = new EventEmitter<ContributieBedragen>();
  
/***************************************************************************************************
/ Lees de bedragen in via input param en als die is null dan lees ze zelf
/***************************************************************************************************/
  ngOnInit(): void {
    if (this.contributieBedragen != null) {
      this.setFormFields(this.contributieBedragen);
    }
    else {
      this.registerSubscription(
        this.paramService.readParamData$("ContributieBedragen", JSON.stringify(new ContributieBedragen()), 'Contributie bedragen')
          .subscribe({
            next: (data) => {
              let contributieBedragen = JSON.parse(data as string) as ContributieBedragen;
              this.setFormFields(contributieBedragen);
            },
            error: (error: AppError) => {
              console.log("error", error);
            }
          })
      );
    }
  }

/***************************************************************************************************
/ 
/***************************************************************************************************/
  onSubmit(): void {
    let contributieBedragen = new ContributieBedragen();
    contributieBedragen.HalfjaarVolwassenen = this.HalfjaarVolwassenen.value;
    contributieBedragen.HalfjaarJeugd = this.HalfjaarJeugd.value;
    contributieBedragen.CompetitieBijdrageVolwassenen = this.CompetitieBijdrageVolwassenen.value;
    contributieBedragen.CompetitieBijdrageJeugd = this.CompetitieBijdrageJeugd.value;
    contributieBedragen.ZwerflidPercentage = this.ZwerflidPercentage.value;
    contributieBedragen.Donateur = this.Donateur.value;
    contributieBedragen.Pakket = this.Pakket.value;
    contributieBedragen.HalfjaarJeugdExtraTraining = 0;

    this.registerSubscription(
      this.paramService.saveParamData$("ContributieBedragen", JSON.stringify(contributieBedragen), 'Contributie bedragen')
        .subscribe({
          next: (data) => {
            this.changedAmounts.emit(contributieBedragen);
            this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
          },
          error: (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
              this.showSnackBar(SnackbarTexts.NoChanges, '');
            } else { throw error; }
          }
        })
    );
  }

/***************************************************************************************************
/ 
/***************************************************************************************************/
  private setFormFields(contributieBedragen: ContributieBedragen): void {
    this.HalfjaarVolwassenen.setValue(contributieBedragen.HalfjaarVolwassenen);
    this.HalfjaarJeugd.setValue(contributieBedragen.HalfjaarJeugd);
    this.CompetitieBijdrageVolwassenen.setValue(contributieBedragen.CompetitieBijdrageVolwassenen);
    this.CompetitieBijdrageJeugd.setValue(contributieBedragen.CompetitieBijdrageJeugd);
    this.ZwerflidPercentage.setValue(contributieBedragen.ZwerflidPercentage);
    this.Donateur.setValue(contributieBedragen.Donateur);
    this.Pakket.setValue(contributieBedragen.Pakket);
    this.changedAmounts.emit(contributieBedragen);
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get HalfjaarVolwassenen(): AbstractControl {
    return this.contributieForm.get('HalfjaarVolwassenen');
  }
  get HalfjaarJeugd(): AbstractControl {
    return this.contributieForm.get('HalfjaarJeugd');
  }
  get CompetitieBijdrageVolwassenen(): AbstractControl {
    return this.contributieForm.get('CompetitieBijdrageVolwassenen');
  }
  get CompetitieBijdrageJeugd(): AbstractControl {
    return this.contributieForm.get('CompetitieBijdrageJeugd');
  }
  get HalfjaarBondBijdrage(): AbstractControl {
    return this.contributieForm.get('HalfjaarBondBijdrage');
  }
  get ZwerflidPercentage(): AbstractControl {
    return this.contributieForm.get('ZwerflidPercentage');
  }
  get Donateur(): AbstractControl {
    return this.contributieForm.get('Donateur');
  }
  get Pakket(): AbstractControl {
    return this.contributieForm.get('Pakket');
  }
}
