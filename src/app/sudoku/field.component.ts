import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Board } from "../model/sudoku/board";
import { Store, select } from "@ngrx/store";
import { FieldContent } from "../model/sudoku/fieldContent";
import { CipherSet } from "../model/sudoku/cipherset";
import { Move } from "../model/sudoku/move";
import { Position } from "../model/sudoku/position";

export @Component({
    selector: 'field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.scss']
})
class FieldComponent {
    @Input()  board = new Board();
    @Input()  xcontent: string = "";
    @Input()  pos: Position = Position.NoPosition;
    @Output() digitUpdated = new EventEmitter<Move>();
    isEditing = false;

    constructor() { 
        if (this.board.fieldContent(this.pos).hasDigit()) {
            console.log(this.board.fieldContent(this.pos).digit());
        }
    }
    
    get fieldColor(): string {
        if (this.hasError) {
            return "errorField";
        }
        return "normalField";
    }

    get field(): FieldContent {
        return this.board.fieldContent(this.pos);
    }

    get displayDigit(): string {
        if (this.contentDigit.length==0) {
            return "&nbsp;";
        }
        return this.contentDigit;
    }

    get hasDigit(): boolean {
        return this.contentDigit.length!=0;
    }

    get hasError(): boolean {
        return this.board.hasError(this.pos);
    }

    get showAllowance(): boolean {
        return true;
    }

    // get content(): string {
    //     return this.field.getDigitString();
    // }

    // set content(digit: any) {
    //     this.field.digit = digit;
    // }

    allows(digit: number): boolean {
        return this.field.allows(digit);
    }

    allowanceDigit(digit: number): string {
        if (this.field.allows(digit)) {
            return digit.toString();
        }
        return '_';
    }

    get contentDigit(): string {
        return this.field.getDigitString();
    }

    set contentDigit(digit: any) {
        this.field.setDigit(digit);
    }

    onKey(digitString: string) {
        var oldMove = this.field.getMove();
        if (digitString.length==0) {
            console.log("empty");
            this.contentDigit = digitString;            
            this.digitUpdated.emit(new Move(this.pos));
        } else {
            var digit = Number.parseInt(digitString);
            if (CipherSet.chars.includes(digitString)) {
                console.log(digitString);
                this.digitUpdated.emit(new Move(this.pos, digit));
            } else {
                console.log("Not allowed: '"+digitString+"'");
                this.field.setMove(oldMove);
            }
        }
        console.log("Content " + (this.contentDigit.length==0 ? 'removed' : this.contentDigit));
    }

    onEdit() {
        this.isEditing = true;
      }
    
    onEdited() {
        this.isEditing = false;
    }    
}