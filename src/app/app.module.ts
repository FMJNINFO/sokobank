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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SudokuComponent,
    FieldComponent,
    BoxComponent,
    AllowedComponent,
    ControlComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    StatusService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
