import { Position } from "./position";

export class Move {
    _pos: Position = Position.NoPosition;
    _digit: number = -1;

    constructor(pos: Position, digit: number=0) {
        this._pos = pos;
        this._digit = digit;
    }

    get pos(): Position {
        return this._pos;
    }

    get digit(): number {
        return this._digit;
    }

    setDigit(digit: number) {
        this._digit = digit;
    }

    hasDigit(): boolean {
        return this._digit != 0;
    }

    copy(): Move {
        return new Move(this._pos, this._digit);
    }

    toString(): string {
        var s = this._pos.toString();
        s += " = " + (this.hasDigit() ? this._digit : "empty");
        return s;
    }
}