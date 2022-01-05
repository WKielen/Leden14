import { CommonModule } from '@angular/common';

import { NgModule } from '@angular/core';
import { CustomMaterialModule } from 'src/app/material.module';
import { A2hsComponent } from './a2hs/a2hs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DemoFormControlComponent } from './demo.formcontrol.component';

const componentList = [
  A2hsComponent,
  DemoFormControlComponent
]
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomMaterialModule,
    FlexLayoutModule,
  ],
  declarations: [
    ...componentList
  ],
  exports: [
    ...componentList
  ]
})
export class SharedComponentsModule { }
