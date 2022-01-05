import { Component, Inject, OnInit, Input } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';
import { DialogRecord } from "./DialogRecord";


@Component({
    selector: 'app-website-dialog',
    templateUrl: './trainingoverzicht.dialog.html',
    styleUrls: ['./trainingoverzicht.dialog.scss']

})
export class TrainingOverzichtDialogComponent implements OnInit {

    cb_maandag: boolean = false;
    cb_dinsdag: boolean = false;
    cb_woensdag: boolean = false;
    cb_donderdag: boolean = false;
    cb_vrijdag: boolean = false;
    cb_emptylines: boolean = true;

    csvOptions = {
        fieldSeparator: ';',
        quoteStrings: '"',
        decimalSeparator: ',',
        showLabels: true,
        showTitle: false,
        title: 'Training Aanwezigheid',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        filename: ''
        // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };


    constructor(
        public dialogRef: MatDialogRef<TrainingOverzichtDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data:DialogRecord,
    ) {}

    ngOnInit(): void {
        // console.log('this.data',this.data);
        
        for (let i = 0; i < this.data.displayDaysOfWeek.length; i++) {
            switch (this.data.displayDaysOfWeek[i]) {
                case 1: this.cb_maandag = true;
                    break;
                case 2: this.cb_dinsdag = true;
                    break;
                case 3: this.cb_woensdag = true;
                    break;
                case 4: this.cb_donderdag = true;
                    break;
                case 5: this.cb_vrijdag = true;
                    break;
            }
        }
        this.cb_emptylines = this.data.showEmptyLines;
    }

    /***************************************************************************************************
    / Geef de parameters terug aan het form als de dialog wordt afgesloten
    /***************************************************************************************************/
    onExit(): void {
        this.data.displayDaysOfWeek = new Array<number>();
        if (this.cb_maandag) {
            this.data.displayDaysOfWeek.push(1);
        }
        if (this.cb_dinsdag) {
            this.data.displayDaysOfWeek.push(2);
        }
        if (this.cb_woensdag) {
            this.data.displayDaysOfWeek.push(3);
        }
        if (this.cb_donderdag) {
            this.data.displayDaysOfWeek.push(4);
        }
        if (this.cb_vrijdag) {
            this.data.displayDaysOfWeek.push(5);
        }
        this.data.showEmptyLines = this.cb_emptylines;
        this.dialogRef.close(this.data);
    }

    /***************************************************************************************************
    / Het huidige scherm kan worden gedownload in een CSV
    /***************************************************************************************************/
    onDownloadOverzicht(): void {
        let dynamicDownload = new DynamicDownload();
        let fileName = "Trainingsdeelname " + new Date().to_YYYY_MM_DD();
        dynamicDownload.dynamicDownloadTxt(this.data.downloadList, fileName, 'csv');
    }

    /***************************************************************************************************
    / De waarde boven de slider om een aantal dagen aan te geven wordt geformatteerd. 
    /***************************************************************************************************/
    formatSliderLabel(value: number): string {
        return value + ' d';
      }

}
