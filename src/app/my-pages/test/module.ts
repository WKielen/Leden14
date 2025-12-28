import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TestComponent } from './test.component';
import { CustomMaterialModule } from 'src/app/material.module';
import { SharedComponentsModule } from 'src/app/shared/components/component.module';
import { HoldableModule } from 'src/app/shared/directives/directives.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ComponentsModule } from 'src/app/components/component.module';


@NgModule({
  declarations: [
    TestComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TestComponent
      }
    ]),
    CommonModule,
    CustomMaterialModule,
    HoldableModule,
    ComponentsModule,
    SharedComponentsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    TestComponent,
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    },
 ],
})

export class Module { }
