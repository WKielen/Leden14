import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaComponent } from './area/area.component';
import { PieComponent } from './pie/pie.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [
    AreaComponent,
    PieComponent,
  ],
  imports: [
    CommonModule,
    HighchartsChartModule,
  ],
  exports: [
    AreaComponent,
    PieComponent,
  ]
})
export class HighGraphsModule { }
