import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SubscribeEventPageComponent } from './subscribe-event.component';
import { CustomMaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/component.module';
import { WimsLibModule } from 'wims-lib';
import { environment } from 'src/environments/environment';


@NgModule({
  declarations: [
    SubscribeEventPageComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SubscribeEventPageComponent
      }
    ]),
    CommonModule,
    CustomMaterialModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    WimsLibModule.forRoot({ config: environment }),   // Zie module (en service)  voor implementatie van forRoot

  ],
  exports: [
    SubscribeEventPageComponent,
  ]
})

export class Module { }
