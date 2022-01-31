import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BaseComponent } from './components/base.component';
import { CustomMaterialModule } from './material.module';
import { WimsLibComponent } from './wims-lib.component';
import { Configurations } from './wims-lib.service';

const componentList = [
  WimsLibComponent, 
  BaseComponent,
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
  public static forRoot(config: Configurations): ModuleWithProviders<WimsLibModule> {

    return {
      ngModule: WimsLibModule,
      providers: [
        { provide: Configurations, useValue: config }
      ]
    };
  }
  
}
