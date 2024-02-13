import { CipherSet } from "./cipherset";
import { Board } from "./board";
import { Position } from "./position";
import { Move } from "./move";

export class FieldContent {
    static NoFieldContent = new FieldContent(new Move(Position.NoPosition), CipherSet.fullCipherSet());

    _move: Move;
    _allowed: CipherSet;

    constructor(move: Move, allowed: CipherSet = new CipherSet(...Board.AllAllowed)) {
        this._move = move;
        if (move.hasDigit()) {
            this._allowed = new CipherSet(move.digit);
        } else {
            this._allowed = allowed;
        }
    }

    get pos(): Position {
        return this._move.pos;
    }

    hasDigit(): boolean {
        return this._move.hasDigit();
    }

    isEmpty(): boolean {
        return !this._move.hasDigit();
    }

    digit(): number {
        return this._move.digit;
    }

    setDigit(digit: number) {
        this._move.setDigit(digit);
    }

    getMove(): Move {
        return this._move.copy();
    }

    get allowSet(): CipherSet {
        return this._allowed;
    }

    setAllowSet(cs: CipherSet) {
        this._allowed = cs;
    }

    allows(digit: number): boolean {
        return this._allowed.contains(digit);        
    }

    copy(): FieldContent {
        return new FieldContent(this._move.copy());
    }

    toString(): string {
        var s = this._move.pos.toString();
        if (this.isEmpty()) {
            s += ": " + this.allowSet.toListString();
        } else {
            s += " = " + this._move.digit.toString();
        }
        return s;
    }
}
