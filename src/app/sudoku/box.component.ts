import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Board } from "../model/sudoku/board";
import { Store, select } from "@ngrx/store";
import { FieldContent } from "../model/sudoku/fieldContent";
import { Move } from "../model/sudoku/move";
import { Position } from "../model/sudoku/position";

export @Component({
    selector: 'box',
    templateUrl: './box.component.html',
    styleUrls: ['./box.component.scss']
})

class BoxComponent {
    // _boxIndices = [
    //     [  0,  1,  2,  9, 10, 11, 18, 19, 20 ],
    //     [  3,  4,  5, 12, 13, 14, 21, 22, 23 ],
    //     [  6,  7,  8, 15, 16, 17, 24, 25, 26 ],
    //     [ 27, 28, 29, 36, 37, 38, 45, 46, 47 ],
    //     [ 30, 31, 32, 39, 40, 41, 48, 49, 50 ],
    //     [ 33, 34, 35, 42, 43, 44, 51, 52, 53 ],
    //     [ 54, 55, 56, 63, 64, 65, 72, 73, 74 ],
    //     [ 57, 58, 59, 66, 67, 68, 75, 76, 77 ],
    //     [ 60, 61, 62, 69, 70, 71, 78, 79, 80 ]
    // ];
    @Input() board: Board = new Board;
    @Input() boxId: number = -1;

    constructor() { 
        
    }

    boxField(idInBox: number): FieldContent {
        if ((idInBox<0) || (idInBox>=9)) {
            throw new ReferenceError("Box has 9 entries, so index "+idInBox+" doesn't exist.");
        }
        return this.board.fieldContent(Position.box(this.boxId)[idInBox]);
    }

    calcPos(idInBox: number): Position {
        return Position.box(this.boxId)[idInBox];
    }

    value(idInBox: number): string {
        const field = this.boxField(idInBox);
        if (field.hasDigit()) {
            return "" + field.digit();
        }
        return "";
    }

    digitChanged(move: Move) {
        console.log("Field " + move.toString());
        this.board.add(move);
    }
}