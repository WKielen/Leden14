import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { GraphData } from 'src/app/my-pages/dashboard/dashboard.component';


@Component({
  selector: 'app-widget-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

  chartOptions: {};
  
  @Input() data: GraphData;

  Highcharts = Highcharts;

  constructor() { }

  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'area'
      },
      title: {
        text: this.data.Title
      },
      subtitle: {
        text: this.data.SubTitle
      },


      xAxis: {
        categories: this.data.xAxis,
        tickmarkPlacement: 'on',
        title: {
          enabled: false
        }
      },
      yAxis: {
        title: {
          text: this.data.yAxisTitle
        }
      },

      tooltip: {
        split: true,
        valueSuffix: this.data.LegendaSuffix
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: true,
      },
      series: this.data.Data
    };

    HC_exporting(Highcharts);

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

}
