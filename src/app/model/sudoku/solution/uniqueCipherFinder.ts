import { Board } from "../board";
import { CipherSet } from "../cipherset";
import { Cause, FieldContent } from "../fieldContent";
import { Move } from "../move";
import { Position } from "../position";
import { Solver } from "../solver";


export class UniqueCipherFinder {
    static username = "UniqueCipher";
    static cause = Cause.UNIQUE_CIPHER;
    _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
    }

    #candidates(board: Board, group: Position[]): FieldContent[] {
        return board.fieldContents(group).filter((fc) => fc.isEmpty());
    }

    #findAllInGroup(board: Board, group: Position[]): Move[] {
        const fcs = this.#candidates(board, group);
        const frequency = fcs.reduce((frq, fc) => fc.allowSet.addFrequency(frq), CipherSet.emptyFrequency());

        let moves: Move[] = []        
        let fc: FieldContent | undefined;
        let digit: number;

        for (let j=0; j<9; j++) {
            if (frequency[j] === 1) {
                digit = j+1;
                fc = fcs.find((fc) => fc.allowSet.contains(digit));
                if (fc === undefined) {
                    throw new SyntaxError("Should never happen.")
                }
                moves.push(new Move(fc.pos, digit));
            }                                    
        }
        return moves;
    }

    #findOne(board: Board): Move[] {
        let moves: Move[] = [];

        if (this._solver.memory.lastUser !== UniqueCipherFinder.username) {
            this._solver.adjustMemory(UniqueCipherFinder.username);
            this._solver.memory.uniqueCiphers = this.#findAll(board);
            this._solver.memory.uniqueCipherOfs = -1;
        }
        this._solver.memory.uniqueCipherOfs += 1;
        if (this._solver.memory.uniqueCiphers.length > this._solver.memory.uniqueCipherOfs) {
            moves.push(this._solver.memory.uniqueCiphers[this._solver.memory.uniqueCipherOfs]);
        } else {
            if (this._solver.memory.uniqueCiphers.length > 0) {
                this._solver.memory.uniqueCipherOfs -= this._solver.memory.uniqueCiphers.length; 
                moves.push(this._solver.memory.uniqueCiphers[this._solver.memory.uniqueCipherOfs]);
            }
        }
        return moves;
    }

    #findAll(board: Board): Move[] {
        let founds: Map<number, Move> = new Map();
        let moves: Move[];
        for (let [sGrp, grp] of Position.namedGrps()) {        
            moves = this.#findAllInGroup(board, grp);
            for (let move of moves) {
                founds.set(move.pos.pos, move);
            }
        }
        return Array.from(founds.values());
    }

    markOne(board: Board) {
        let moveSet = new Set(this.#findOne(board).map((m) => m.pos));
        board.mark(moveSet);
    }

    markAll(board: Board) {
        this._solver.adjustMemory();
        let moveSet = new Set(this.#findAll(board).map((m) => m.pos));
        board.mark(moveSet);
    }

    solveOne(board: Board) {
        let moves = this.#findOne(board);
        moves.forEach((move) => board.add(move, UniqueCipherFinder.cause));
    }

    solveAll(board: Board) {
        this._solver.adjustMemory();
        let moves = this.#findAll(board);
        moves.forEach((move) => board.add(move, UniqueCipherFinder.cause));
    }

    #findGroupUniqueCiphers(board: Board, group: Position[], findAll: boolean=true): Move[] {
        let emptyFields: FieldContent[] = [];
        let frequency: number[];
        let fc: FieldContent | undefined;
        let moves: Move[] = [];
        let move: Move;

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

    findUniqueCiphers(board: Board, findAll: boolean=true): Move[] {
        let doLogging = false;
        let moves: Move[];
        let joinedMoves: Move[] = [];
        for (let [sGrp, grp] of Position.namedGrps()) {
            if (doLogging)
                console.log("Look for unique cipher in " + sGrp)
            moves = this.#findGroupUniqueCiphers(board, grp, findAll);
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
    
}