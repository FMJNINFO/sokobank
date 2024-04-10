import { Position } from "./position";

export class Move {
    static AllowedChars = "123456789";
    static SpaceChar = ".";
    static NO_MOVE = new Move(Position.NoPosition);

    _pos: Position;
    _digit: number;

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

    equals(move: Move): boolean {
        if (this.pos.pos != move.pos.pos) {
            return false;
        }
        if (this.digit != move.digit) {
            return false;
        }
        return true;
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
        let s = this._pos.toString();
        s += " = " + (this.hasDigit() ? this._digit : "-");
        return s;
    }
}