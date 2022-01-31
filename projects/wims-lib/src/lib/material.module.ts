import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
   exports: [
    // MatToolbarModule,
    // MatButtonModule,
    // MatInputModule,
    // MatDialogModule,
    // MatFormFieldModule,
    // MatSidenavModule,
    // MatIconModule,
    // MatListModule,
    // MatSliderModule,
    // MatCheckboxModule,
    // MatRadioModule,
    // MatMenuModule,
    // MatSelectModule,
    // MatSnackBarModule,
    // MatDatepickerModule,
    // MatTableModule,
    // MatExpansionModule,
    // MatBadgeModule,
    MatCardModule,
    // MatProgressBarModule,
    // MatGridListModule,
    // MatTooltipModule,
    // MatDividerModule,
    // MatTabsModule,
    // MatProgressSpinnerModule,
    // MatSlideToggleModule,
    // MatChipsModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class CustomMaterialModule { }

