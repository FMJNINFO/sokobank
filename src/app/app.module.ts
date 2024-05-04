import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ControlComponent } from './sudoku/control.component';
import { SudokuComponent } from './sudoku/sudoku.component';
import { FormsModule } from '@angular/forms';
import { FieldComponent } from './sudoku/field.component';
import { BoxComponent } from './sudoku/box.component';
import { AllowedComponent } from './sudoku/allowed.component';
import { StatusService } from './services/status.service';
import { CheatAreaComponent } from './sudoku/cheatarea.component';
import { CheatButtonsComponent } from './sudoku/cheatbuttons.component';
import { ImExportComponent } from './sudoku/imexport.component';
import { DigitHighlightingComponent } from './sudoku/digitHighlighting.component';
import { DigitSelectComponent } from './sudoku/digitselect.component';
import { OverlayModule } from "@angular/cdk/overlay";
import { InfoComponent } from './info.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SudokuComponent,
    FieldComponent,
    BoxComponent,
    AllowedComponent,
    ControlComponent,
    CheatAreaComponent,
    CheatButtonsComponent,
    ImExportComponent,
    DigitHighlightingComponent,
    DigitSelectComponent,
    InfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    OverlayModule
  ],
  providers: [
    StatusService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
