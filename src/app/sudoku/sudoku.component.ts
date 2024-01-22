import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Board } from "../model/sudoku/board";
import { Store, select } from "@ngrx/store";
import { Move } from "../model/sudoku/move";

export @Component({
    selector: 'sudoku',
    templateUrl: './sudoku.component.html',
    styleUrls: ['./sudoku.component.scss']

})
class SudokuComponent {
    @Input() board: Board = new Board();

    // constructor(private readonly store: Store) {
    //     // this.board$ = this.store.pipe(select(loadBoard));
    //   }

    digitChanged(move: Move) {
        console.log("XField " + move.pos + " = '" + move.value + "'");        
    }    
}