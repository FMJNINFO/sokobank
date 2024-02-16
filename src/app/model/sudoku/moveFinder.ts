import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { Move } from "./move";
import { Position } from "./position";

export class MoveFinder {
    
    constructor() {
    }

    findLonelyCiphers(board: Board, findAll: boolean=true): Move[] {
        var moves: Move[] = [];
        var move: Move;

        var fcLonelyCiphers = board.allEmptyFieldContents()
            .filter((fc) => fc.allowSet.length === 1);
        for (let fc of fcLonelyCiphers) {
            move = new Move(fc.pos, fc.allowSet.entries[0]);
            moves.push(move);
            if (!findAll) {
                return moves;
            }
        }
        return moves;
    }

    findUniqueCiphers(board: Board, findAll: boolean=true): Move[] {
        var doLogging = false;
        let moves: Move[];
        let joinedMoves: Move[] = [];
        for (let [sGrp, grp] of Position.namedGrps()) {
            if (doLogging)
                console.log("Look for unique cipher in " + sGrp)
            moves = this._findGroupUniqueCiphers(board, grp, findAll);
            if (!findAll && (moves.length > 0)) {
                return moves;
            }
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

    _findGroupUniqueCiphers(board: Board, group: Position[], findAll: boolean=true): Move[] {
        var emptyFields: FieldContent[] = [];
        var frequency: number[];
        let fc: FieldContent | undefined;
        var moves: Move[] = [];
        var move: Move;

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
                        move = new Move(fc.pos, j+1);
                        moves.push(move);
                        if (!findAll) {
                            return moves;
                        }
                    }
                }                                    
            }
        }
        return moves;
    }

    stringToMoves(s: string, ): Move[] {        
        const pool = Position.pool();
        let moves = new Array<Move>();
        let ch: string | undefined;
        let digit: number | undefined;
        let ofs = 0;
        let iPos = 0;

        while (iPos < 81) {
            ch = s.at(ofs);
            ofs += 1;
            if ((ch === undefined) || (ch === Board.SpaceChar)) {
                digit = 0;
            } else {
                if (Board.AllowedChars.includes(ch)) {
                    digit = parseInt(ch);
                } else {
                    digit = undefined;
                }
            }
            if (digit !== undefined) {
                moves.push(new Move(pool[iPos], digit))
                iPos += 1;
            }
        }
        return moves;
    }
}