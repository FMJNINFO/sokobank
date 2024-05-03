import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { Position } from "../model/sudoku/position";
import { StatusService } from "../services/status.service";
import { Cause } from "../model/sudoku/cause";
import { loggingActive } from "../model/sudoku/logger";

export @Component({
    selector: 'field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.scss'],
    host: {
        '(document:keydown)': 'handleKeyboardEvent($event)'
      }    
})
class FieldComponent {
    @Input()  pos: Position = Position.NoPosition;
    _isEditing = false;

    constructor(private service: StatusService) { 
    }

    get isEditing(): boolean {
        return this.service.digitEditorPos.equals(this.pos);
    }

    get digitSelectorVisible(): boolean {
        console.log("DigitSelectorVisible: "+this.service.isInTouchMode());
        return this.isEditing && this.service.isInTouchMode();
    }

    get fieldColor(): string {
        let _fieldColor = "";
        if (this.#hasError) {
            if (this.isEditing) {
                _fieldColor = "editingErrorField";
            } else {
                _fieldColor = "errorField";
            }
        } else {
            if (this.isEditing) {
                _fieldColor = "editingField";
            } else {
                if (this.#isMarked) {
                    _fieldColor = "markedField";
                } else {
                    if (this.#isEmphasized) {
                        _fieldColor = "emphasizedField";
                    } else {
                        _fieldColor = "normalField";
                    }
                }
            }
        }
        return _fieldColor;
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
        let hasDigit = this.service.getDigit(this.pos) != 0;
        return hasDigit;
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
            if (event.target != null) {
                let tgt = event.target as HTMLBaseElement;
                if (tgt.nodeName != 'BODY') {
                    //  we only handle key event not connected to any component
                    return;
                }
            }

            if (loggingActive) {
                console.log(event);
            }
            this.#handleKeyString(event.key, !this.service.isInTouchMode());
            event.stopImmediatePropagation();
        }
    }

    #handleKeyString(keyString: string, continueEditing: boolean) {
        let digit = this.#toDigit(keyString);
        if (digit != 0) {
            this.#setDigit(digit);
            if (continueEditing) {
                this.service.digitEditorPos = this.pos.right();
            } else {
                this.service.stopDigitEditing();
            }
        }
        if (continueEditing) {
            switch(keyString) {
                case "ArrowRight":  this.service.digitEditorPos = this.pos.right(); break;
                case "ArrowLeft":   this.service.digitEditorPos = this.pos.left(); break;
                case "ArrowUp":     this.service.digitEditorPos = this.pos.up(); break;
                case "ArrowDown":   this.service.digitEditorPos = this.pos.down(); break;
                case "Escape":      this.service.stopDigitEditing(); break;
                case " ":           this.service.digitEditorPos = this.pos.right(); break;
                case "Delete":      this.#setDigit(0); break;
            }
        }
    }

    switchEditStarted() {
        this.#switchEdit(false)
    }

    #switchEdit(switchedByTouch: boolean) {
        if (this.isEditing) {
            if (switchedByTouch || !this.service.isInTouchMode()) {
                //  Nur, wenn der switch nicht aus einem Click nach einem Touch stammt
                this.service.stopDigitEditing();
            }
        } else {
            this.service.digitEditorPos = this.pos;
        }
    }

    touchEditStarted(event: TouchEvent) {
        this.#switchEdit(true);
        this.service.startTouchMode();
    }
}