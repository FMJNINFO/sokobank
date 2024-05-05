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
    static NOT_SOLVABLE = "Found NO solution.";
    static EVAL_VALUE_PREFIX_UNIQUE = "Evaluation: ";
    static EVAL_VALUE_PREFIX_NOT_UNIQUE = "Least found evaluation: ";
    static EVALUATING = "... Evaluation running ...";

    _evalSolved : boolean | undefined = undefined;
    _evalUnique : boolean = false;
    _evalValue: string = "";
    _evalActive = false;
    evaluationState: string = "";

    constructor(private service: StatusService) {
    }

    get evaluationClass(): string {
        if (this._evalSolved == undefined) {
            return "invisible";
        }
        return "showing";
    }

    #refreshEvaluationState() {
        if (this._evalSolved == undefined) {
            if (this._evalActive) {
                this.evaluationState = SudokuComponent.EVALUATING;
            } else {
                this.evaluationState = "";
            }
        } else {
            if (this._evalSolved) {
                if (this._evalUnique) {
                    this.evaluationState = SudokuComponent.UNIQUE_SOLVABLE;
                } else {
                    this.evaluationState = SudokuComponent.SOLVABLE_BUT_NOT_UNIQUE
                }
            } else {
                this.evaluationState = SudokuComponent.NOT_SOLVABLE;
            }
        }
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
        this.service.stopDigitEditing();
        this._evalActive = true;
        this._evalSolved = undefined;
        this.#refreshEvaluationState();
        [this._evalSolved, this._evalUnique, this._evalValue] = this.service.evaluate();
        this._evalActive = false;
        this.#refreshEvaluationState();
    }

    doCleanBoard($event: Event) {
        this._evalSolved = undefined;
        this.service.stopDigitEditing();
        this.service.cleanBoard();
        this.service.findAllCheats();
    }

    isFillCompleteAllowed():boolean {
        return this.service.isFillCompleteAllowed();
    }
}