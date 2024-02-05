import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Board } from "../model/sudoku/board";
import { Store, select } from "@ngrx/store";

export @Component({
    selector: 'sudoku',
    templateUrl: './sudoku.component.html',
    styleUrls: ['./sudoku.component.scss']

})
class SudokuComponent {
    @Input() board: Board = new Board();
}