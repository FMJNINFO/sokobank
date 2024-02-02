import { Component, OnInit } from '@angular/core';
import { Board } from '../model/sudoku/board';
import { logBoard, message } from '../model/sudoku/logger';
import { testBoardMaster0, testBoardMaster1, testBoardMaster2, testBoardMaster3 } from '../model/sudoku/testboards';
import { Solver } from '../model/sudoku/solver';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    title = "";
    board: Board;
    solver: Solver;

    constructor() {
        this.solver = new Solver();

        this.board = testBoardMaster3();
        logBoard(this.board);
        console.log("");
    }

    ngOnInit() {}

    updateTitle(value: string) {
        console.log(`updateTitle: ${value}`);
        this.title = value;
    }

    setTestBoard0($event: Event) {
        this.board = testBoardMaster0();
        logBoard(this.board);
        console.log("");
    }

    setTestBoard1($event: Event) {
        this.board = testBoardMaster1();
        logBoard(this.board);
        console.log("");
    }

    setTestBoard2($event: Event) {
        this.board = testBoardMaster2();
        logBoard(this.board);
        console.log("");
    }

    setTestBoard3($event: Event) {
        this.board = testBoardMaster3();
        logBoard(this.board);
        console.log("");
    }

    doFindLonelyCipher($event: Event) {
        var doLogging = true;

        var moves = this.solver.findAllLonelyCiphers(this.board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Lonely cipher: " + move.toString())
            }
            console.log("-- Find Lonely Cipher done.")
        }
    }

    doFindUniqueCiphers($event: Event) {
        var doLogging = true;

        var moves = this.solver.findAllUniqueCiphers(this.board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Found unique cipher: " + move.toString());
            }
            console.log("-- Find Unique Cipher done.")
        }
    }

    doFindClosedGroup($event: Event) {
        var closedGroups = this.solver.findAllClosedGroups(this.board);
        for (let cg of closedGroups.sortedByName()) {
            console.log(cg.toString())
        }
        console.log("-- Find Closed Group done.")
    }

    doFillAutomatic($event: Event) {
        this.solver.solve(this.board);
    }

    doResolveByTrial($event: Event) {
        if (this.board.emptyFields() > 60) {
            message("Insufficient filled fields to resolve by trial.");
        }
        var moves = this.solver.findAllResolvingMoves(this.board);
        if (moves.length > 0) {
            console.log("Found resolving moves at:")
            for (let move of moves) {
                console.log("   " + move.toString())
            }
        } else {
            console.log("Found no solution")
        }
    }
}

