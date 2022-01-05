import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomMaterialModule } from 'src/app/material.module';

import { CompAdminComponent } from './comp-admin.component';

@NgModule({
  declarations: [
    CompAdminComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: CompAdminComponent
      }
    ]),
    CustomMaterialModule
  ]
})

export class Module { }
