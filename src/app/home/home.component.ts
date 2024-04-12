import { Component, OnInit } from '@angular/core';
import { message } from '../model/sudoku/logger';
import { TestBoardMoves } from '../model/sudoku/testboardMoves';
import { StatusService } from '../services/status.service';

@Component({    
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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

    ngOnInit() {}

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
                return HomeComponent.UNIQUE_SOLVABLE;
            } else {
                return HomeComponent.SOLVABLE_BUT_NOT_UNIQUE
            }
        }
        return HomeComponent.NOT_SOLVABLE;
    }

    get evaluationValue(): string {
        if ((this._evalSolved == undefined) || !this._evalSolved) {
            return "";
        }
        if (this._evalUnique) {
            return HomeComponent.EVAL_VALUE_PREFIX_UNIQUE + " " + this._evalValue;
        } else {
            return HomeComponent.EVAL_VALUE_PREFIX_NOT_UNIQUE + " " + this._evalValue;
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

