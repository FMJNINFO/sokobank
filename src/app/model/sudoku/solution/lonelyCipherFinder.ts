import { Board } from "../board";
import { Cause, FieldContent } from "../fieldContent";
import { Move } from "../move";
import { Solver } from "../solver";


export class LonelyCipherFinder {
    static username = "LonelyCipher";
    static cause = Cause.LONELY_CIPHER;
    private _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
    }

    #candidates(board: Board): FieldContent[] {
        return board.allEmptyFieldContents().filter((fc) => fc.allowSet.length === 1);
    }

    #findOne(board: Board): Move[] {
        var moves: Move[] = [];

        if (this._solver.memory.lastUser !== LonelyCipherFinder.username) {
            this._solver.adjustMemory(LonelyCipherFinder.username);
            this._solver.memory.lonelyCiphers = this.#findAll(board);
            this._solver.memory.lonelyCipherOfs = -1;
        }
        this._solver.memory.lonelyCipherOfs += 1;
        if (this._solver.memory.lonelyCiphers.length > this._solver.memory.lonelyCipherOfs) {
            moves.push(this._solver.memory.lonelyCiphers[this._solver.memory.lonelyCipherOfs]);
        } else {
            if (this._solver.memory.lonelyCiphers.length > 0) {
                this._solver.memory.lonelyCipherOfs -= this._solver.memory.lonelyCiphers.length; 
                moves.push(this._solver.memory.lonelyCiphers[this._solver.memory.lonelyCipherOfs]);
            }
        }
        return moves;
    }

    #findAll(board: Board): Move[] {
        var moves: Move[] = [];
        var moves = this.#candidates(board).map((fc) => new Move(fc.pos, fc.allowSet.entries[0]));
        return moves;
    }

    markOne(board: Board) {
        var moveSet = new Set(this.#findOne(board).map((m) => m.pos));
        board.mark(moveSet);
    }

    markAll(board: Board) {
        this._solver.adjustMemory();
        var moveSet = new Set(this.#findAll(board).map((m) => m.pos));
        board.mark(moveSet);
    }

    solveOne(board: Board) {
        var moves = this.#findOne(board);
        moves.forEach((move) => board.add(move, LonelyCipherFinder.cause));
    }

    solveAll(board: Board) {
        this._solver.adjustMemory();
        var moves = this.#findAll(board);
        moves.forEach((move) => board.add(move, LonelyCipherFinder.cause));
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
}