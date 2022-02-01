import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BaseComponent } from './components/base.component';
import { DialogMessageBoxComponent } from './components/dialog.message.box';
import { CustomMaterialModule } from './material.module';
import { WimsLibComponent } from './wims-lib.component';

const componentList = [
  WimsLibComponent, 
  BaseComponent,
  DialogMessageBoxComponent,
];

@NgModule({
  declarations: [...componentList],
  imports: [
    CommonModule,
    CustomMaterialModule,
  ],
  exports: [...componentList]
})
export class WimsLibModule { 

  // Create this static method in the library module.
  public static forRoot(config: Object): ModuleWithProviders<WimsLibModule> {

    return {
      ngModule: WimsLibModule,
      providers: [
        { provide: Object, useValue: config }
      ]
    };
  }
  
}
