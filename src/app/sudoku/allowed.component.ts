import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Board } from "../model/sudoku/board";
import { Store, select } from "@ngrx/store";
import { FieldContent } from "../model/sudoku/fieldContent";
import { CipherSet } from "../model/sudoku/cipherset";
import { Move } from "../model/sudoku/move";
import { Position } from "../model/sudoku/position";

export @Component({
    selector: 'allowed',
    templateUrl: './allowed.component.html',
    styleUrls: ['./allowed.component.scss']
})
class AllowedComponent {
    @Input() board = new Board();
    @Input() field: FieldContent = FieldContent.NoFieldContent;
    @Input() digit: number = 0;  

    constructor() { 
        // if (this.board.fieldContent(this.pos).hasDigit()) {
        //     console.log(this.board.fieldContent(this.pos).digit());
        // }
    }

    allows(digit: number): boolean {
        return this.field.allows(digit);
    }

    allowanceDigit(digit: number): string {
        if (this.field.allows(digit)) {
            return digit.toString();
        }
        return '_';
    }

    get hasError(): boolean {
        return this.board.hasError(this.field.pos);
    }

    get fieldColor(): string {
        if (this.hasError) {
            return "errorField";
        }
        return "normalField";
    }
}