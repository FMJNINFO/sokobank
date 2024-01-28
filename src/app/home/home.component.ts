import { Component, OnInit } from '@angular/core';
import { Board } from '../model/sudoku/board';
import { logBoard, message } from '../model/sudoku/logger';
import { testBoardMaster0, testBoardMaster1, testBoardMaster2, testBoardMaster3 } from '../model/sudoku/testboards';
import { Position } from '../model/sudoku/position';
import { FieldContent } from '../model/sudoku/fieldContent';
import { Move } from '../model/sudoku/move';
import { GroupCleaner } from '../model/sudoku/groupCleaner';
import { CipherSet } from '../model/sudoku/cipherset';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    title = "";
    board: Board;

    constructor() {
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

        var moves = this.findLonelyCipher(this.board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Lonely cipher: " + move.toString())
            }
            console.log("-- Find Lonely Cipher done.")
        }
    }

    findLonelyCipher(board: Board): Move[] {
        var moves: Move[] = [];

        var fcLonelyCiphers = board.allEmptyFieldContents()
            .filter((fc) => fc.allowSet.length === 1);
        for (let fc of fcLonelyCiphers) {
            moves.push(new Move(fc.pos, Move.SRC_LONELY_CIPHER, fc.allowSet.entries[0]))
        }
        return moves;
    }

    doFindUniqueCiphers($event: Event) {
        var doLogging = true;

        var moves = this.findAllUniqueCiphers(this.board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Found unique cipher: " + move.toString());
            }
            console.log("-- Find Unique Cipher done.")
        }
    }

    findAllUniqueCiphers(board: Board): Move[] {
        var doLogging = false;
        let moves: Move[];
        let joinedMoves: Move[] = [];
        for (let [sGrp, grp] of Position.namedGrps()) {
            if (doLogging)
                console.log("Look for unique cipher in " + sGrp)
            moves = this.findUniqueCipher(board, grp);
            for (let move of moves) {
                if (doLogging)
                    console.log("Found unique cipher in " + sGrp + ": " + move.toString())
                if (joinedMoves.find((m) => (m.pos.pos == move.pos.pos)) == undefined) {
                    joinedMoves.push(move);
                } else {
                    if (doLogging)
                        console.log("... but we know it already.")
                }
            }
        }
        return joinedMoves;
    }

    findUniqueCipher(board: Board, group: Position[]): Move[] {
        var emptyFields: FieldContent[] = [];
        var frequency: number[];
        let fc: FieldContent | undefined;
        var moves: Move[] = [];

        frequency = CipherSet.emptyFrequency();
        emptyFields = board.fieldContents(group).filter((fc) => fc.isEmpty()); 
        for (let fc of emptyFields) {
            frequency = fc.allowSet.addFrequency(frequency);
        }
        for (let j=0; j<9; j++) {
            if (frequency[j] == 1) {
                fc = emptyFields.find((fc) => fc.allowSet.contains(j+1));
                if (fc != undefined) {
                    if (moves.find((m) => (fc!=undefined) && (m.pos.pos == fc.pos.pos)) == undefined) {
                        moves.push(new Move(fc.pos, Move.SRC_UNIQUE_CIPHER, j+1));
                    }
                }                                    
            }
        }
        return moves;
    }

    doFindClosedGroup($event: Event) {
        var closedGroups = this.findClosedGroups(this.board);

        for (let group of closedGroups) {
            let sPoss: string = "";
            let allows = new CipherSet();
            for (let pos of group) {
                sPoss += pos.toString() + " "
                allows = allows.or(this.board.fieldContent(pos).allowSet)
            }
            console.log("Closed group for " + allows.toListString() + ": " + sPoss);
        }
        console.log("-- Find Closed Group done.")
    }

    findClosedGroups(board: Board): Position[][] {
        var doLogging = true;
        var groupCleaner = new GroupCleaner(board);
        var anzGroups = groupCleaner.countSubsets();
        var closedGroups: Position[][] = [];

        if (doLogging)
            console.log("Done " + anzGroups + " checks, found " + groupCleaner.groups.length + " groups." );

        for (let i=0; i<groupCleaner.groups.length; i++) {
            let group = groupCleaner.groups[i];
            closedGroups.push(group);
        }
        return closedGroups;
    }

    fillAutomatic(board: Board) {
        var newDigit: boolean;
        var moves: Move[];

        do {
            newDigit = false;
            moves = this.findLonelyCipher(board);
            if (moves.length > 0) {
                newDigit = true;
                board.add(moves[0]);
                continue;
            }
            moves = this.findAllUniqueCiphers(board);
            if (moves.length > 0) {
                newDigit = true;
                board.add(moves[0]);
                continue;
            }
        } while (newDigit);

        if (board.isFull()) {
            for (let fc of board.allFieldContents()) {
                console.log(fc.getMove().toString() + " by " + fc.getMove().getSourceText());
            }
        } else {
            this.findClosedGroups(board);
        }
    }

    doFillAutomatic($event: Event) {
        this.fillAutomatic(this.board);
    }

    doResolveByTrial($event: Event) {
        if (this.board.emptyFields() > 60) {
            message("Insufficient filled fields to resolve by trial.");
        }
        var moves = this.findResolvingMoves(this.board);
        if (moves.length > 0) {
            console.log("Found resolving moves at:")
            for (let move of moves) {
                console.log("   " + move.toString())
            }
        } else {
            console.log("Found no solution")
        }
    }
    
    findResolvingMoves(board: Board): Move[] {
        var fcCandidates: FieldContent[] = [];
        var count = 9;
        var resolutionMove: Move;   //dummy
        var solutionMoves: Move[] = []

        for (let fc of board.allEmptyFieldContents()) {
            if (fc.allowSet.length < count) {
                fcCandidates = []
                count = fc.allowSet.length;
                fcCandidates.push(fc);
            } else {
                if (fc.allowSet.length == count) {
                    fcCandidates.push(fc);
                }
            }
        }
        if (count == 2) {
            for (let fc of fcCandidates) {
                resolutionMove = this.tryFieldPossibilities(board, fc);
                if (resolutionMove.hasDigit()) {
                    console.log("Found resolving move at " + resolutionMove.toString())
                    solutionMoves.push(resolutionMove)
                } else {
                    console.log("Found no resolving move at " + resolutionMove.pos.toString())
                }
            }
        } else {
            console.log("Minimal count of all empty fields is " + count)
        }
        return solutionMoves;
    }

    tryFieldPossibilities(board: Board, fc: FieldContent): Move {
        var resolutionMove = new Move(fc.pos, Move.SRC_TRIAL);   //dummy
        var emptyFieldCount: number;
        var testBoard: Board;
        var testPos = fc.pos;
        var testMove: Move;

        for (let digit of fc.allowSet.entries) {
            testBoard = board.copy();
            testBoard.stopInitialize();
            testMove = new Move(testPos, Move.SRC_TRIAL, digit);
            testBoard.add(testMove);
            emptyFieldCount = testBoard.emptyFields();
            this.fillAutomatic(testBoard);
            if (testBoard.isFull()) {
                resolutionMove = testMove;
                console.log("Move " + testMove.toString() + " yields a solution.");
                break;
            } else {
                logBoard(testBoard);
                if (testBoard.hasErrors()) {
                    console.log("Move " + testMove.toString() + " yields an ERROR.");
                } else {
                    console.log("Move " + testMove.toString() + " yields " + (emptyFieldCount-testBoard.emptyFields()) + " field contents.")
                }
            }
        }
        return resolutionMove;
    }
}

