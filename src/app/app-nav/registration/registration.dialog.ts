import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Role, WebsiteService } from 'src/app/services/website.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { RolesDialogComponent } from './roles.dialog';
import { Md5 } from 'ts-md5';
import { LedenItem, LedenService } from 'src/app/services/leden.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { ICheckboxDictionaryItem } from 'src/app/components/checkbox.list.component';


@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration.dialog.html',
  styles: ['#dropdown { margin-left: 40px; }']
})

export class RegistrationDialogComponent extends BaseComponent implements OnInit {
  actionItemForm = new UntypedFormGroup({
    userid: new UntypedFormControl(
      '',
      [Validators.required]
    ),
    firstname: new UntypedFormControl(),
    lastname: new UntypedFormControl(),
    email: new UntypedFormControl(
      '',
      [Validators.email]
    ),
    password: new UntypedFormControl(),
    role: new UntypedFormControl(),
  });

  public myCheckboxDictionairy: Array<ICheckboxDictionaryItem> = [];
  public roles: Array<Role> = [];
  public ledenLijst: Array<LedenItem> = [] // Alleen voor de dropdown van het component
  showLidOnDropDown = "";// Het lid dat de dropdown laat zien.

  constructor(
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    public websiteService: WebsiteService,
    public ledenService: LedenService,
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data,
  ) { super()
  }

  ngOnInit(): void {
    this.ledenService.getActiveMembers$()
    .subscribe({
      next: (data) => {
        this.ledenLijst = data;
      },
      error: (error: AppError) => {
        console.log("error", error);
      }
    });
    this.roles = this.websiteService.getRoles();
    this.roles.forEach(role => {
      let present: boolean = false;
      if (this.data.data.Role.includes(role.Code))
        present = true;
      this.myCheckboxDictionairy.push({ 'DisplayValue': role.DisplayValue, 'Value': present },);
    });


    console.log('binnen', this.data.data);
    this.userid.setValue(this.data.data.Userid);
    this.firstname.setValue(this.data.data.FirstName);
    this.lastname.setValue(this.data.data.LastName);
    this.email.setValue(this.data.data.Email);
    this.showLidOnDropDown = this.data.data.LidNr ? this.data.data.LidNr : '';
  }

  /***************************************************************************************************
  / Sluit dialog
  /***************************************************************************************************/
  onSubmit(): void {
    this.data.data.Userid = this.userid.value;
    this.data.data.FirstName = this.firstname.value;
    this.data.data.LastName = this.lastname.value;
    this.data.data.Email = this.email.value;
    this.data.data.Role = '';

    if (this.password.value) {
      this.data.data.Password = Md5.hashStr(this.password.value);
    }

    let rollen:Array<string> = [];
    for (let i = 0; i < this.myCheckboxDictionairy.length; i++) {
      if (this.myCheckboxDictionairy[i].Value)
        rollen.push(this.roles[i].Code)
    }
    this.data.data.Role = rollen.join();
    this.dialogRef.close(this.data.data);
  }
  /******************************************************************************************;
  /
  /***************************************************************************************************/
  onRoleClicked($event): void {
    if ($event instanceof MouseEvent) return;
    this.myCheckboxDictionairy[$event.RowNr].Value = $event.Value;
  }
  /***************************************************************************************************
  /
  /***************************************************************************************************/
  onShowRoles() {
    this.dialog.open(RolesDialogComponent)
  }

  onLidSelected($event) {
    this.data.data.LidNr = $event;
  }


  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get userid() {
    return this.actionItemForm.get('userid');
  }
  get firstname() {
    return this.actionItemForm.get('firstname');
  }
  get lastname() {
    return this.actionItemForm.get('lastname');
  }
  get email() {
    return this.actionItemForm.get('email');
  }
  get password() {
    return this.actionItemForm.get('password');
  }
}
