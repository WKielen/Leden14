import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SubscribeEventPageComponent } from './subscribe-event.component';
import { CustomMaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/component.module';


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
  ],
  exports: [
    SubscribeEventPageComponent,
  ]
})

export class Module { }
