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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SudokuComponent,
    FieldComponent,
    BoxComponent,
    CipherComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
