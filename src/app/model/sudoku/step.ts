import { Board, Cheat } from "./board";
import { Cause } from "./cause";
import { Move } from "./move";
import { Position } from "./position";

export class Step implements Cheat {
    _move: Move;
    _cause: Cause;

    constructor(cause: Cause, pos: Position=Position.NoPosition, digit: number=0) {
        this._move = new Move(pos, digit);
        this._cause = cause;
    }

    apply(board: Board) {
        board.addStep(this);        
    }

    affectedBy(pos: Position): boolean {
        return this.pos.pos == pos.pos;
    }

    get pos(): Position {
        return this._move.pos;
    }

    get cause(): Cause {
        return this._cause;
    }

    get move(): Move {
        return this._move;
    }

    isIn(steps: Step[]) {
        if (steps.length === 0) {
            return false;
        }
        let found = steps.find((step) => this.pos.pos === step.pos.pos);
        return found;
    }

    hasDigit(): boolean {
        return this._move._digit != 0;
    }

    toString(): string {
        let s = this._move.toString() + "  by " + this._cause;
        return s;
    }

    static get EMPTY_STEPS(): Step[] {
        let steps: Step[] =  [];
        return steps;
    }

    static stringToSteps(s: string, ): Step[] {
        const pool = Position.pool();
        let steps: Step[] = [];
        let ch: string | undefined;
        let digit: number | undefined;
        let ofs = 0;
        let iPos = 0;

        while (iPos < 81) {
            ch = s.at(ofs);
            if (ch === undefined) {
                ch = Move.SpaceChar;
            }
            ofs += 1;
            if ((ch === Move.SpaceChar) || Move.AllowedChars.includes(ch)) {
                if (ch !== Move.SpaceChar) {
                    digit = parseInt(ch);
                    steps.push(new Step(Cause.PRESET, pool[iPos], digit))
                }
                iPos += 1;
            }
        }
        return steps;
    }

    static summarizeCauses(steps: Step[]): Map<Cause, number> {
        let summary = new Map<Cause, number>();

        Object.values(Cause).forEach((cause) => summary.set(cause, 0))

        let count: number | undefined;
        for (let step of steps) {
            count = summary.get(step.cause);
            if (count !== undefined) {
                summary.set(step.cause, count+1);
            }
        }

        return summary;
    }

    static compress(steps: Step[]): Step[] {
        let inxs: Set<number> = new Set();
        let compressedSteps: Step[] = [];
        for (let step of steps.reverse()) {
            if (!inxs.has(step.pos.pos)) {
                inxs.add(step.pos.pos);
                if (step.hasDigit()) {
                    compressedSteps.push(step)
                }
            }
        }
        steps.reverse();
        return compressedSteps.reverse();
    }
}