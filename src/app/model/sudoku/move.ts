import { Position } from "./position";

export class Move {
    static AllowedChars = "123456789";
    static SpaceChar = ".";

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
        let s = this._pos.toString();
        s += " = " + (this.hasDigit() ? this._digit : "empty");
        return s;
    }

    static stringToMoves(s: string, ): Move[] {
        const pool = Position.pool();
        let moves = new Array<Move>();
        let ch: string | undefined;
        let digit: number | undefined;
        let ofs = 0;
        let iPos = 0;

        while (iPos < 81) {
            ch = s.at(ofs);
            ofs += 1;
            if ((ch === undefined) || (ch === Move.SpaceChar)) {
                digit = 0;
            } else {
                if (Move.AllowedChars.includes(ch)) {
                    digit = parseInt(ch);
                } else {
                    digit = undefined;
                }
            }
            if (digit !== undefined) {
                moves.push(new Move(pool[iPos], digit))
                iPos += 1;
            }
        }
        return moves;
    }
}