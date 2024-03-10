import { Board } from "../board";
import { Cause, FieldContent } from "../fieldContent";
import { Move } from "../move";
import { Solver } from "../solver";


export class LonelyCipherFinder {
    static username = "LonelyCipher";
    static cause = Cause.LONELY_CIPHER;
    _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
    }

    #candidates(board: Board): FieldContent[] {
        return board.emptyFieldContents().filter((fc) => fc.allowSet.length === 1);
    }

    #findOne(board: Board): Move[] {
        let moves: Move[] = [];

        if (this._solver.memory.lastUser !== LonelyCipherFinder.username) {
            this._solver.updateMemory(LonelyCipherFinder.username);
            this._solver.memory.lonelyCiphers = this.findAll(board);
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

    findAll(board: Board): Move[] {
        let moves: Move[] = this.#candidates(board).map((fc) => new Move(fc.pos, fc.allowSet.entries[0]));
        return moves;
    }

    solveAll(board: Board): boolean {
        this._solver.updateMemory();
        let moves = this.findAll(board);
        let moveCount = moves.length;
        moves.forEach((move) => board.add(move, LonelyCipherFinder.cause));
        return moveCount > 0;
    }

    findLonelyCiphers(board: Board, findAll: boolean=true): Move[] {
        let moves: Move[] = [];
        let move: Move;

        let fcLonelyCiphers = board.emptyFieldContents()
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