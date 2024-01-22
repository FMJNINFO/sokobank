import { Position } from "./position";

export class Move {
    static CAUSE_UNKNOWN = 'Unknown'
    static CAUSE_PRESET = 'Preset'
    static CAUSE_INPUT  = 'Input'
    static CAUSE_UNIQUE_CIPHER = '(Auto) Unique Cipher'

    _pos: Position = Position.NoPosition;
    _digit: number = -1;
    _cause: string = Move.CAUSE_UNKNOWN;

    constructor(pos: Position, digit: number) {
        this._pos = pos;
        this._digit = (Number.isNaN(digit) ? 0 : digit);
    }

    get value(): string {
        if (this.hasDigit()) {
            return "" + this._digit;
        } else {
            return " empty";
        }
    }

    get pos(): Position {
        return this._pos;
    }

    get digit(): number {
        return this._digit;
    }

    hasDigit(): boolean {
        return this._digit != 0;
    }

    set cause(newCause: string) {
        this._cause = newCause
    }

    get cause(): string {
        return this.cause;
    }

    toString(): string {
        var s = this._pos.toString();
        s += " = " + (this.hasDigit() ? this._digit : "empty");
        return s;
    }
}