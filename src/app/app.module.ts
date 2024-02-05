import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SudokuComponent } from './sudoku/sudoku.component';
import { CipherComponent } from './sudoku/cipher.component';
import { FormsModule } from '@angular/forms';
import { FieldComponent } from './sudoku/field.component';
import { BoxComponent } from './sudoku/box.component';
import { AllowedComponent } from './sudoku/allowed.component';
import { EditingService } from './services/editing.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SudokuComponent,
    FieldComponent,
    BoxComponent,
    CipherComponent,
    AllowedComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    EditingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
