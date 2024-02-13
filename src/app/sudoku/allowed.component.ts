import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { StatusService } from "../services/status.service";
import { Position } from "../model/sudoku/position";

export @Component({
    selector: 'allowed',
    templateUrl: './allowed.component.html',
    styleUrls: ['./allowed.component.scss']
})
class AllowedComponent {
    @Input() digit: number = 0;  
    @Input()  pos: Position = Position.NoPosition;

    constructor(private service: StatusService) { 
    }

    allows(digit: number): boolean {
        return this.service.isAllowed(this.pos, digit);
    }

    allowanceDigit(digit: number): string {
        if (this.service.isAllowed(this.pos, digit)) {
            return digit.toString();
        }
        return '_';
    }

    get hasError(): boolean {
        return this.service.hasError(this.pos);
    }

    get fieldColor(): string {
        if (this.hasError) {
            return "errorField";
        }
        return "normalField";
    }
}