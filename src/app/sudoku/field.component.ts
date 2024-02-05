import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Board } from "../model/sudoku/board";
import { Store, select } from "@ngrx/store";
import { FieldContent } from "../model/sudoku/fieldContent";
import { CipherSet } from "../model/sudoku/cipherset";
import { Move } from "../model/sudoku/move";
import { Position } from "../model/sudoku/position";
import { EditingService } from "../services/editing.service";

export @Component({
    selector: 'field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.scss'],
    host: {
        '(document:keydown)': 'handleKeyboardEvent($event)'
      }    
})
class FieldComponent {
    @Input()  board = new Board();
    @Input()  xcontent: string = "";
    @Input()  pos: Position = Position.NoPosition;
    @Output() digitUpdated = new EventEmitter<Move>();
    @Output() editChange = new EventEmitter<Position>();
    _isEditing = false;

    constructor(private editingService: EditingService) { 
        if (this.board.fieldContent(this.pos).hasDigit()) {
            console.log(this.board.fieldContent(this.pos).digit());
        }
        editingService.shouldEdit$.subscribe(pos => this.onEditorChanged(pos));        
    }
    
    get isEditing(): boolean {
        return this._isEditing;
    }

    set isEditing(value: boolean) {
        this._isEditing = value;
    }

    get fieldColor(): string {
        if (this.hasError) {
            if (this.isEditing) {
                return "editingErrorField";
            } else {
                return "errorField";
            }
        } else {
            if (this.isEditing) {
                return "editingField";
            } else {
                return "normalField";
            }
        }
    }

    get field(): FieldContent {
        return this.board.fieldContent(this.pos);
    }

    get displayDigit(): string {
        if (this.contentDigit.length==0) {
            return " ";
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

    private toDigit(sDigit: string): number {
        switch(sDigit) {
            case "1":   return 1;
            case "2":   return 2;
            case "3":   return 3;
            case "4":   return 4;
            case "5":   return 5;
            case "6":   return 6;
            case "7":   return 7;
            case "8":   return 8;
            case "9":   return 9;
            }
        return 0;
    }

    setDigit(digit: number) {
        let move = this.field.getMove()
        move.setDigit(digit)
        this.board.add(move)
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.isEditing) {
            console.log(event);
            let digit = this.toDigit(event.key);
            if (digit != 0) {
                this.setDigit(digit);
                // this.editingService.shouldEdit$.emit(Position.NoPosition);
                this.editingService.shouldEdit$.emit(this.field.pos.right());
            }
            event.stopImmediatePropagation();
            switch(event.key) {
                case "ArrowRight":  this.editingService.shouldEdit$.emit(this.field.pos.right()); break;
                case "ArrowLeft":   this.editingService.shouldEdit$.emit(this.field.pos.left()); break;
                case "ArrowUp":     this.editingService.shouldEdit$.emit(this.field.pos.up()); break;
                case "ArrowDown":   this.editingService.shouldEdit$.emit(this.field.pos.down()); break;
                case "Escape":      this.editingService.shouldEdit$.emit(Position.NoPosition); break;
                case " ":           this.editingService.shouldEdit$.emit(this.field.pos.right()); break;
                case "Delete":      this.setDigit(0); break;
            }
        }
    }

    switchEdit() {
        this.isEditing = !this.isEditing;
        if (this.isEditing) {
            this.editingService.shouldEdit$.emit(this.pos);
        } else {
            this.editingService.shouldEdit$.emit(Position.NoPosition);
        }
    }

    private onEditorChanged(pos: Position) {
        this.isEditing = (pos.equals(this.field.pos));
        if (this.isEditing) {
            console.log("Current editor is " + this.pos);
        }
    }
}