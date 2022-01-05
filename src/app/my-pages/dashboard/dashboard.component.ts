import { Component, OnInit, HostListener } from '@angular/core';
import { LedenItemExt, LedenService, LidTypeValues } from 'src/app/services/leden.service';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { DateRoutines } from 'src/app/services/leden.service';
import { AuthService } from 'src/app/services/auth.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends BaseComponent implements OnInit {

  private todayMoment = moment();
  private todayDate = moment().toDate();
  private ledenDataArray: Array<localLid> = [];

  // input voor de linechart
  public bigChart = null;
  private referenceDateArray: Date[] = [];
  private xAxisValueArray: string[] = [];

  // input variables for voor pie charts
  public pieChart1 = null;
  public pieChart2 = null;
  public pieChart3 = null;

  private countMemberArray: number[] = [];
  private countJuniorMemberArray: number[] = [];
  private countSeniorMemberArray: number[] = [];;

  private countSenMale: number = 0;
  private countSenFemale: number = 0;
  private countJunMale: number = 0;
  private countJunFemale: number = 0;

  private countAge_0_10: number = 0;
  private countAge_11_12: number = 0;
  private countAge_13_14: number = 0;
  private countAge_15_16: number = 0;
  private countAge_17_18: number = 0;
  private countAge_19_23: number = 0;
  private countAge_24_35: number = 0;
  private countAge_35_65: number = 0;
  private countAge_65_100: number = 0;

  private countMembershipLenght_1: number = 0;
  private countMembershipLenght_2: number = 0;
  private countMembershipLenght_3: number = 0;
  private countMembershipLenght_5: number = 0;
  private countMembershipLenght_7: number = 0;
  private countMembershipLenght_10: number = 0;
  private countMembershipLenght_20: number = 0;
  private countMembershipLenght_30: number = 0;


  constructor(
    public authService: AuthService,
    public ledenService: LedenService) {
    super()
  }

  ngOnInit() {
    /***************************************************************************************************
    / We halen alle leden op en vullen vervolgens de counters.
    /***************************************************************************************************/
    let sub = this.ledenService.getAll$()
    .subscribe({
      next: (data: Array<localLid>) => {
        this.ledenDataArray = data;
        this.FillTheCounters();
        this.bigChart = this.GetDataForLineChart();
        this.pieChart1 = this.GetDataForMaleFemalePie();
        this.pieChart2 = this.GetDataForAgePie();
        this.pieChart3 = this.GetDataForMemberschipPie();;
      }
    });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / We vullen de counters voor al de vier grafieken
  /***************************************************************************************************/
  FillTheCounters(): void {

    // Vanaf hier gaan we actuele gegevens voor de piecharts verzamelen
    this.ledenDataArray.forEach(lid => {
      if (lid.Opgezegd == '1') return;
      lid.Leeftijd = DateRoutines.AgeRel(new Date(lid.GeboorteDatum), this.todayDate);
      lid.membershipYears = this.todayMoment.get('years') - moment(lid.LidVanaf).get('years');

      if (lid.Leeftijd <= LidTypeValues.MAXYOUTHAGE) {
        if (lid.Geslacht == 'M') {
          this.countJunMale += 1;
        } else {
          this.countJunFemale += 1;
        }
      } else {
        if (lid.Geslacht == 'M') {
          this.countSenMale += 1;
        } else {
          this.countSenFemale += 1;
        }
      }

      switch (true) {
        case lid.Leeftijd <= 10: {
          this.countAge_0_10 += 1;
          break;
        }
        case lid.Leeftijd <= 12: {
          this.countAge_11_12 += 1;
          break;
        }
        case lid.Leeftijd <= 14: {
          this.countAge_13_14 += 1;
          break;
        }
        case lid.Leeftijd <= 17: {
          this.countAge_15_16 += 1;
          break;
        }
        case lid.Leeftijd <= 19: {
          this.countAge_17_18 += 1;
          break;
        }
        case lid.Leeftijd <= 23: {
          this.countAge_19_23 += 1;
          break;
        }
        case lid.Leeftijd <= 35: {
          this.countAge_24_35 += 1;
          break;
        }
        case lid.Leeftijd <= 65: {
          this.countAge_35_65 += 1;
          break;
        }
        default: {
          this.countAge_65_100 += 1;
          break;
        }
      }

      switch (true) {
        case lid.membershipYears <= 1: {
          this.countMembershipLenght_1 += 1;
          break;
        }
        case lid.membershipYears <= 2: {
          this.countMembershipLenght_2 += 1;
          break;
        }
        case lid.membershipYears <= 3: {
          this.countMembershipLenght_3 += 1;
          break;
        }
        case lid.membershipYears <= 5: {
          this.countMembershipLenght_5 += 1;
          break;
        }
        case lid.membershipYears <= 7: {
          this.countMembershipLenght_7 += 1;
          break;
        }
        case lid.membershipYears <= 10: {
          this.countMembershipLenght_10 += 1;
          break;
        }
        case lid.membershipYears <= 20: {
          this.countMembershipLenght_20 += 1;
          break;
        }
        default: {
          this.countMembershipLenght_30 += 1;
          break;
        }
      }
    });

    // Eerst creeren we de datums op de x-as
    this.CreateArrayWithReferenceDates();   // fills referenceDateArray and xAxisValueArray
    
    // per datum op de x-as gaan we het aantal leden tellen
    this.referenceDateArray.forEach(referenceDate => {
      let countLeden = 0;
      let countJuniorLeden = 0;
      let countSeniorLeden = 0;
      
      // voor een datum gaan we alle leden langs of ze misschien al lid waren.
      this.ledenDataArray.forEach((lid:localLid) => {
        let lidvanaf: Date = new Date(lid.LidVanaf);
        let lidtot: Date = new Date(lid.LidTot);
        
        if (lidvanaf < referenceDate && (referenceDate < lidtot || lid.Opgezegd == '0')) {
          countLeden += 1;
          
          let age = DateRoutines.AgeRel(new Date(lid.GeboorteDatum), referenceDate);
          if (age <= LidTypeValues.MAXYOUTHAGE) {
            countJuniorLeden += 1;
          } else {
            countSeniorLeden += 1;
          }
        }
      });

      // we hebben de tellers voor een datum. Voeg ze toe aan de array
      this.countMemberArray.push(countLeden);
      this.countJuniorMemberArray.push(countJuniorLeden);
      this.countSeniorMemberArray.push(countSeniorLeden);
    });
  }


  /***************************************************************************************************
  / Definitie voor de 3 lijnen op de lijngrafiek
  /***************************************************************************************************/
  GetDataForLineChart(): GraphData {
    let lineData = new GraphData();
    lineData.xAxis = this.xAxisValueArray;
    lineData.Title = 'Ledenontwikkeling';
    lineData.SubTitle = 'vanaf 2013';
    lineData.yAxisTitle = 'Aantal Leden';
    lineData.LegendaSuffix = ' leden';

    lineData.Data = [{
      name: 'Totaal',
      data: this.countMemberArray
    }, {
      name: 'Volwassenen',
      data: this.countSeniorMemberArray
    }, {
      name: 'Jeugd',
      data: this.countJuniorMemberArray
    }
    ];

    return lineData;
  }

  /***************************************************************************************************
  / Maak een array met datums die onder aan de line grafiek komen te staan
  /***************************************************************************************************/
  CreateArrayWithReferenceDates(): void {
    let mydate = moment('2013-01-01');
    while (mydate < this.todayMoment) {
      let date = mydate.toDate();
      this.referenceDateArray.push(date);
      this.xAxisValueArray.push(formatDate(date, 'yyyy-MM', 'nl'));
      mydate = mydate.add(6, 'M');
    }
    this.referenceDateArray.push(new Date());
    this.xAxisValueArray.push(formatDate(new Date(), 'yyyy-MM', 'nl'));
  }


  /***************************************************************************************************
  / PIE 1: Vrouw / Man verdeling
  /***************************************************************************************************/
  GetDataForMaleFemalePie(): GraphData {
    let pieData = new GraphData();
    pieData.Title = 'Vrouw / Man verdeling';
    pieData.yAxisTitle = 'leden';
    pieData.LabelFormat = '<b>{point.name}</b>: {point.percentage:.1f} %';
    pieData.TooltipFormat = '{point.y} {series.name}: <b>{point.percentage:.1f}%</b>';


    pieData.Data = [{
      name: 'Vrouw',
      y: this.countSenFemale,
      sliced: true,
    }, {
      name: 'Man',
      y: this.countSenMale
    }, {
      name: 'Jongen',
      y: this.countJunMale
    }, {
      name: 'Meisje',
      y: this.countJunFemale,
      sliced: true

    }];

    return pieData;
  }


  /***************************************************************************************************
  / PIE 2: Leeftijd verdeling
  /***************************************************************************************************/
  GetDataForAgePie(): GraphData {
    let pieData = new GraphData();
    pieData.Title = 'Leeftijd verdeling';
    pieData.yAxisTitle = 'leden';
    pieData.LabelFormat = '<b>{point.name}</b>: {point.percentage:.1f} %';
    pieData.TooltipFormat = '{point.y} {series.name}: <b>{point.percentage:.1f}%</b>';
    pieData.Data = [{
      name: 'Onder 11',
      y: this.countAge_0_10,
    }, {
      name: 'Onder 13',
      y: this.countAge_11_12
    }, {
      name: 'Onder 15',
      y: this.countAge_13_14
    }, {
      name: 'Onder 17',
      y: this.countAge_15_16,
    }, {
      name: 'Onder 19',
      y: this.countAge_17_18,
    }, {
      name: 'Onder 23',
      y: this.countAge_19_23,
    }, {
      name: '26-35 jaar',
      y: this.countAge_24_35
    }, {
      name: '36-65 jaar',
      y: this.countAge_35_65
    }, {
      name: '> 65 jaar',
      y: this.countAge_65_100,
    }];

    return pieData;
  }

  /***************************************************************************************************
  / PIE 3: Lenghte Lidmaatschap verdeling
  /***************************************************************************************************/
  GetDataForMemberschipPie(): GraphData {
    let pieData = new GraphData();
    pieData.Title = 'Lengte lidmaatschap';
    pieData.yAxisTitle = 'leden';
    pieData.LabelFormat = '<b>{point.name}</b>: {point.percentage:.1f} %';
    pieData.TooltipFormat = '{point.y} {series.name}: <b>{point.percentage:.1f}%</b>';
    pieData.Data = [{
      name: '< 1 jaar',
      y: this.countMembershipLenght_1,
    }, {
      name: '2 jaar',
      y: this.countMembershipLenght_2
    }, {
      name: '3 jaar',
      y: this.countMembershipLenght_3
    }, {
      name: '4-5 jaar',
      y: this.countMembershipLenght_5,
    }, {
      name: '6-7 jaar',
      y: this.countMembershipLenght_7,
    }, {
      name: '8-10 jaar',
      y: this.countMembershipLenght_10
    }, {
      name: '11-20 jaar',
      y: this.countMembershipLenght_20
    }, {
      name: '> 20 jaar',
      y: this.countMembershipLenght_30,
    }];

    return pieData;
  }

  /***************************************************************************************************
  /
  /***************************************************************************************************/
  public isSmallScreen: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isSmallScreen = (window.innerWidth < 800);
  }
}

export class GraphData {
  Title: string = '';
  SubTitle: string = '';
  Data: any = [];
  xAxis: any = [];
  yAxisTitle: string = '';
  LegendaSuffix: string = '';
  LabelFormat: string = '';
  TooltipFormat: string = '';
}
class localLid extends LedenItemExt {
  membershipYears: number = 0;
}
