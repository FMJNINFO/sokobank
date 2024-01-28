import { Position } from "./position";

export class Move {
    static SRC_PRESET = 0
    static SRC_INPUT  = 1
    static SRC_UNIQUE_CIPHER = 2
    static SRC_LONELY_CIPHER = 3
    static SRC_TRIAL = 5;

    static SOURCE_TEXT = ['Preset', 'Input', '(Auto) Unique Cipher', '(Auto) Lonely Cipher', '', '(Auto) Trial' ]

    _pos: Position = Position.NoPosition;
    _digit: number = -1;
    _source: number;

    constructor(pos: Position, source: number, digit: number=0) {
        this._pos = pos;
        this._digit = digit;
        this._source = source;
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

    setDigit(digit: number, source: number) {
        this._digit = digit;
        this._source = source;
    }

    hasDigit(): boolean {
        return this._digit != 0;
    }

    copy(): Move {
        return new Move(this._pos, this._source, this.digit);
    }

    get source(): number {
        return this._source;
    }

    getSourceText(): string {
        return Move.SOURCE_TEXT[this.source];
    }

    toString(): string {
        var s = this._pos.toString();
        s += " = " + (this.hasDigit() ? this._digit : "empty");
        return s;
    }
}