import { Board } from "../board";
import { Cause } from "../cause";
import { FieldContent } from "../fieldContent";
import { Solver } from "../solver";
import { Step } from "../step";


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

    getAllSteps(board: Board): Step[] {
        let steps: Step[] = this.#candidates(board).map((fc) => new Step(Cause.LONELY_CIPHER, fc.pos, fc.allowSet.entries[0]));
        return steps;
    }
}