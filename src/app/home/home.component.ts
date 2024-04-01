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
    static SOLVABLE_DONT_KNOW = "Ist wahrscheinlich lösbar.";
    static SOLVABLE_YES = "Ist lösbar.";
    static SOLVABLE_NO = "Ist NICHT lösbar.";

    testBoardMoves: TestBoardMoves;
    _solvableInfo = HomeComponent.SOLVABLE_DONT_KNOW;
    _evaluation = "Click evaluate.";

    constructor(private service: StatusService) {
        this.testBoardMoves = new TestBoardMoves();
        this.setTestBoard("testboard3");
    }

    ngOnInit() {}

    setTestBoard(id: string) {
        this.service.setBoardBySteps(this.testBoardMoves.getSteps(id));
    }

    get solvableInfo(): string {
        return this._solvableInfo;
    }

    get evaluation(): string {
        return this._evaluation;
    }
    
    doEvaluate() {
        let isSolvable: boolean | undefined;
        [isSolvable, this._evaluation] = this.service.evaluation;
        if (isSolvable === undefined) {
            this._solvableInfo = HomeComponent.SOLVABLE_DONT_KNOW;
        } else {
            if (isSolvable) {
                this._solvableInfo = HomeComponent.SOLVABLE_YES;
            } else {
                this._solvableInfo = HomeComponent.SOLVABLE_NO;
            }
        }
    }

    doCleanBoard($event: Event) {
        this.service.cleanBoard();
    }

    doFillLonelyCiphers($event: Event) {
        this.service.fillLonelyCiphers();
    }

    doFillUniqueCiphers($event: Event) {
        this.service.fillUniqueCiphers();
    }

    doFillAutomatic($event: Event) {
        this.service.fillAutomatic();
    }

    doFillBestTrialStep($event: Event) {
        if (this.service.getBoard().emptyFieldCount() > 60) {
            message("Insufficient filled fields (<20) or no resolution found.");
        }
        this.service.fillBestTrialStep();
    }    

    doSolveAutomatic($event: Event) {
        this.service.solveComplete();
    }

    doFindAllCheats($event: Event) {
        this.service.findAllCheats();
    }
}

