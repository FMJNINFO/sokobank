import { CipherSet } from "./cipherset";
import { Board } from "./board";
import { Position } from "./position";
import { Move } from "./move";
import { Cause } from "./cause";

export class FieldContent {
    static NoFieldContent = new FieldContent(Position.NoPosition, CipherSet.fullCipherSet());

    _move: Move;
    _allowed: CipherSet;
    _cause: Cause;

    constructor(pos: Position, allowed: CipherSet = new CipherSet(...Board.AllAllowed)) {
        this._move = new Move(pos);
        this._allowed = allowed;
        this._cause = Cause.INIT;
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

    cause(): Cause {
        return this._cause;
    }

    setDigit(digit: number, cause: Cause) {
        this._move.setDigit(digit);
        this._cause = cause;
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

    toString(): string {
        let s = this._move.pos.toString();
        if (this.isEmpty()) {
            s += ": " + this.allowSet.toListString();
        } else {
            s += " = " + this._move.digit.toString();
        }
        return s;
    }
}