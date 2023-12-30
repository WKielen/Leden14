import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

//import { MatSelectModule } from '@angular/material/select';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

//import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
//import { MatInputModule } from '@angular/material/input';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';


import { MatButtonModule } from '@angular/material/button';
//import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatTableModule } from '@angular/material/table';
//import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatListModule } from '@angular/material/list';
//import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatMenuModule } from '@angular/material/menu';
//import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
//import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
//import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
//import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
//import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
//import { MatCardModule } from '@angular/material/card';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
//import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatSliderModule } from '@angular/material/slider';
//import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatTabsModule } from '@angular/material/tabs';
//import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
//import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
//import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

@NgModule({
   exports: [
    MatToolbarModule,
              MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatSliderModule,
    MatCheckboxModule,
    MatRadioModule,
    MatMenuModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatTableModule,
    MatExpansionModule,
    MatBadgeModule,
    MatCardModule,
    MatProgressBarModule,
    MatGridListModule,
    MatTooltipModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatChipsModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class CustomMaterialModule { }

