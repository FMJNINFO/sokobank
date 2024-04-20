import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { StatusService } from "../services/status.service";

export @Component({
    selector: 'sudoku',
    templateUrl: './sudoku.component.html',
    styleUrls: ['./sudoku.component.scss']

})
class SudokuComponent {
    static UNIQUE_SOLVABLE = "There is a unique solution.";
    static SOLVABLE_BUT_NOT_UNIQUE = "There is a solution, but not unique.";
    static NOT_SOLVABLE = "There is NO solution.";
    static EVAL_VALUE_PREFIX_UNIQUE = "Evaluation: ";
    static EVAL_VALUE_PREFIX_NOT_UNIQUE = "Least found evaluation: ";

    _evalSolved : boolean | undefined = undefined;
    _evalUnique : boolean = false;
    _evalValue: string = "";

    constructor(private service: StatusService) {
    }

    get evaluationClass(): string {
        if (this._evalSolved == undefined) {
            return "invisible";
        }
        return "showing";
    }

    get evaluationState(): string {
        if (this._evalSolved == undefined) {
            return "";
        }
        if (this._evalSolved) {
            if (this._evalUnique) {
                return SudokuComponent.UNIQUE_SOLVABLE;
            } else {
                return SudokuComponent.SOLVABLE_BUT_NOT_UNIQUE
            }
        }
        return SudokuComponent.NOT_SOLVABLE;
    }

    get evaluationValue(): string {
        if ((this._evalSolved == undefined) || !this._evalSolved) {
            return "";
        }
        if (this._evalUnique) {
            return SudokuComponent.EVAL_VALUE_PREFIX_UNIQUE + " " + this._evalValue;
        } else {
            return SudokuComponent.EVAL_VALUE_PREFIX_NOT_UNIQUE + " " + this._evalValue;
        }
    }

    doEvaluate() {
        [this._evalSolved, this._evalUnique, this._evalValue] = this.service.evaluate();
    }

    doCleanBoard($event: Event) {
        this._evalSolved = undefined;
        this.service.cleanBoard();
        this.service.findAllCheats();
    }

    isFillCompleteAllowed():boolean {
        return this.service.isFillCompleteAllowed();
    }
}