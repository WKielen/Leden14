import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CustomMaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DownloadComponent } from './download.component';
import { ComponentsModule } from 'src/app/components/component.module';

@NgModule({
  declarations: [
    DownloadComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DownloadComponent
      }
    ]),
    CommonModule,
    CustomMaterialModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    DownloadComponent,
  ]
})

export class Module { }
