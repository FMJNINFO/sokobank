import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { Move } from "../model/sudoku/move";
import { Position } from "../model/sudoku/position";
import { StatusService } from "../services/status.service";
import { Cause } from "../model/sudoku/cause";

export @Component({
    selector: 'field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.scss'],
    host: {
        '(document:keydown)': 'handleKeyboardEvent($event)'
      }    
})
class FieldComponent {
    @Input()  xcontent: string = "";
    @Input()  pos: Position = Position.NoPosition;
    @Output() digitUpdated = new EventEmitter<Move>();
    @Output() editChange = new EventEmitter<Position>();
    _isEditing = false;

    constructor(private service: StatusService) { 
        service.shouldEdit$.subscribe(pos => this.#onEditorChanged(pos));        
    }
    
    get isEditing(): boolean {
        return this._isEditing;
    }

    setEditing(value: boolean) {
        this._isEditing = value;
    }

    get fieldColor(): string {
        if (this.#hasError) {
            if (this.isEditing) {
                return "editingErrorField";
            } else {
                return "errorField";
            }
        } else {
            if (this.isEditing) {
                return "editingField";
            } else {
                if (this.#isMarked) {
                    return "markedField";
                } else {
                    if (this.#isEmphasized) {
                        return "emphasizedField";
                    } else {
                        return "normalField";
                    }
                }
            }
        }
    }

    get value(): string {
        let digit = this.service.getDigit(this.pos);
        if (digit > 0) {
            return "" + digit;
        }
        return "";
    }

    set value(value: string) {
        let digit = this.#toDigit(value);
        this.service.setDigit(this.pos, digit, Cause.ENTERED);
    }

    get hasDigit(): boolean {
        return this.service.getDigit(this.pos) != 0;
    }

    get #hasError(): boolean {
        return this.service.hasError(this.pos);
    }

    get #isEmphasized(): boolean {
        if (this.hasDigit) {
            return this.service.isDigitEmphasized(this.service.getDigit(this.pos));
        }
        return false;
    }

    get showAllowance(): boolean {
        return this.service.areDigitsVisible();
    }

    get #isMarked(): boolean {
        return this.service.isMarked(this.pos);
    }

    get isHintVisible(): boolean {
        return this.service.isHintVisible();
    }

    #toDigit(sDigit: string): number {
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

    #setDigit(digit: number) {
        this.service.setDigit(this.pos, digit, Cause.ENTERED);
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.isEditing) {
            console.log(event);
            let digit = this.#toDigit(event.key);
            if (digit != 0) {
                this.#setDigit(digit);
                this.service.shouldEdit$.emit(this.pos.right());
            }
            event.stopImmediatePropagation();
            switch(event.key) {
                case "ArrowRight":  this.service.shouldEdit$.emit(this.pos.right()); break;
                case "ArrowLeft":   this.service.shouldEdit$.emit(this.pos.left()); break;
                case "ArrowUp":     this.service.shouldEdit$.emit(this.pos.up()); break;
                case "ArrowDown":   this.service.shouldEdit$.emit(this.pos.down()); break;
                case "Escape":      this.service.shouldEdit$.emit(Position.NoPosition); break;
                case " ":           this.service.shouldEdit$.emit(this.pos.right()); break;
                case "Delete":      this.#setDigit(0); break;
            }
        }
    }

    switchEdit() {
        this.setEditing(!this.isEditing);
        if (this.isEditing) {
            this.service.shouldEdit$.emit(this.pos);
        } else {
            this.service.shouldEdit$.emit(Position.NoPosition);
        }
    }

    #onEditorChanged(pos: Position) {
        this.setEditing(pos.equals(this.pos));
        if (this.isEditing) {
            console.log("Current editor is " + this.pos);
        }
    }
}