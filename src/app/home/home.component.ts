import { Component, OnInit } from '@angular/core';
import { Evaluator } from '../model/sudoku/evaluator';
import { Board } from '../model/sudoku/board';
import { logBoard } from '../model/sudoku/logger';
import { Finder } from '../model/sudoku/finder';
import { testBoardMaster0, testBoardMaster1, testBoardMaster2, testBoardMaster3 } from '../model/sudoku/testboards';
import { ClosedSubgroupJoiner } from '../model/sudoku/closedSubgroupJoiner';
import { SingleDigitAllowed } from '../model/sudoku/singleDigitAllowed';
import { OneAllowanceInGroup } from '../model/sudoku/oneAllowanceInGroup';
import { AllowanceRemovingClosedGroup } from '../model/sudoku/allowanceRemovingClosedGroup';
import { HiddenAllowanceInGroups } from '../model/sudoku/hiddenAllowanceInGroups';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    title = "";
    board: Board;
    evaluator = new Evaluator();
    finder: Finder = new Finder();
    joiner = new ClosedSubgroupJoiner()

    constructor() {
        this.board = testBoardMaster3();
        // this.board.evaluate();
        logBoard(this.board);
        console.log("");
    }

    ngOnInit() {}

    updateTitle(value: string) {
        console.log(`updateTitle: ${value}`);
        this.title = value;
    }

    clickTest1($event: Event) {
        var cleanBoard = this.joiner.cleanUntilOneFound(this.board);
        var cleaned = cleanBoard;
        while (cleanBoard) {
            cleanBoard = this.joiner.cleanUntilOneFound(this.board);
            cleaned = cleaned || cleanBoard;
        }

        var next = this.finder.findNext(this.board);
        if (next != undefined) {
            this.board.set(next.coord.row, next.coord.col, next.value);
            console.log("[" + next.coord.row + "," + next.coord.col + "] = " + next.value);
        }
        logBoard(this.board, next?.coord);
    }    

    clickTest2($event: Event) {
        logBoard(this.board);
        var finder = new SingleDigitAllowed();
        var foundValues = finder.find(this.board);
        if (foundValues.length == 0) {
            console.log("No single digit allowances found.");
        } else {
            for (let foundValue of foundValues) {
                console.log("[" + foundValue.coord.row + "," + foundValue.coord.col + "] = " + foundValue.value);
            }
        }
    }

    clickTest3($event: Event) {
        logBoard(this.board);
        console.log(" ");
        this.finder.findAll(this.board);
        logBoard(this.board);
    }

    clickTest4($event: Event) {
        logBoard(this.board);
        var finder = new OneAllowanceInGroup();
        var foundValues = finder.find(this.board);
        if (foundValues.length == 0) {
            console.log("No unique digit in group allowances found.");
        } else {
            for (let foundValue of foundValues) {
                console.log("[" + foundValue.coord.row + "," + foundValue.coord.col + "] = " + foundValue.value);
            }
        }
    }

    clickTest5($event: Event) {
        var cleanBoard = true;
        var cleaned = false;
        while (cleanBoard) {
            cleanBoard = this.joiner.cleanUntilOneFound(this.board);
            cleaned = cleaned || cleanBoard;
        }

        logBoard(this.board);
        var finder = new SingleDigitAllowed();
        var foundValues = finder.find(this.board);
        if (foundValues.length == 0) {
            finder = new OneAllowanceInGroup();
            foundValues = finder.find(this.board);
            if (foundValues.length == 0) {
                finder = new AllowanceRemovingClosedGroup();
                foundValues = finder.find(this.board);
                if (foundValues.length == 0) {
                    console.log("Neither single digit allowances nor unique digit in group allowance found.");
                }
            }
        }
        this.board.setByCoordValues(foundValues)
        if (this.board.isFull()) {
            console.log("=== DONE ===")
            logBoard(this.board);
        }
    }

    clickTest6($event: Event) {
        logBoard(this.board);
        var finder = new HiddenAllowanceInGroups();
        var foundValues = finder.find(this.board);
    }
}

