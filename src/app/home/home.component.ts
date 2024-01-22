import { Component, OnInit } from '@angular/core';
import { Board } from '../model/sudoku/board';
import { logBoard } from '../model/sudoku/logger';
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

    doFindLonelyCipher($event: Event) {
        var moves = this.findLonelyCipher(this.board);
        for (let move of moves) {
            console.log("Lonely cipher: " + move.toString())
        }
        console.log("-- Find Lonely Cipher done.")
    }

    findLonelyCipher(board: Board): Move[] {
        var moves: Move[] = [];

        var fcLonelyCiphers = board.allEmptyFieldContents()
            .filter((fc) => fc.allowSet.length === 1);
        for (let fc of fcLonelyCiphers) {
            moves.push(new Move(fc.pos, fc.allowSet.entries[0]))
        }
        return moves;
    }

    doFindUniqueCiphers($event: Event) {
        let moves: Move[];

        moves = this.findAllUniqueCiphers(this.board);
        for (let move of moves) {
            console.log("Found unique cipher: " + move.toString());
        }
        console.log("-- Find Unique Cipher done.")
    }

    findAllUniqueCiphers(board: Board): Move[] {
        var doLogging = true;
        let moves: Move[];
        let joinedMoves: Move[] = [];
        for (let [sGrp, grp] of Position.namedGrps()) {
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
        var fieldContents: FieldContent[] = [];
        var frequency: number[];
        let fc: FieldContent | undefined;
        var moves: Move[] = [];

        frequency = CipherSet.emptyFrequency();
        fieldContents = board.fieldContents(group); 
        for (let fc of fieldContents) {
            if (fc.isEmpty()) {
                frequency = fc.allowSet.addFrequency(frequency);
            }
        }
        for (let j=0; j<9; j++) {
            if (frequency[j] == 1) {
                fc = fieldContents.find((fc) => fc.allowSet.contains(j+1));
                if (fc != undefined) {
                    if (moves.find((m) => (fc!=undefined) && (m.pos.pos == fc.pos.pos)) == undefined) {
                        moves.push(new Move(fc.pos, j+1));
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
            console.log("Done " + anzGroups + " checks.")

        for (let i=0; i<groupCleaner.groups.length; i++) {
            let group = groupCleaner.groups[i];
            if (doLogging) {
                let sPoss: string = "";
                for (let pos of group) {
                    sPoss += pos.toString() + " "
                }
                console.log(groupCleaner.joinedAllows[i].toListString() + ": " + sPoss);
            }
            closedGroups.push(group);
        }
        return closedGroups;
    }

    doFillAutomatic($event: Event) {
        var newDigit: boolean;
        var moves: Move[];

        do {
            newDigit = false;
            moves = this.findLonelyCipher(this.board);
            if (moves.length > 0) {
                newDigit = true;
                this.board.add(moves[0]);
                continue;
            }
            moves = this.findAllUniqueCiphers(this.board);
            if (moves.length > 0) {
                newDigit = true;
                this.board.add(moves[0]);
                continue;
            }
        } while (newDigit);
    }
}

