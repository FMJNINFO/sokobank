import { CipherSet } from "./cipherset";
import { Board } from "./board";
import { Position } from "./position";

export class FieldContent {
    static NoFieldContent = new FieldContent(Position.NoPosition, undefined, CipherSet.initCipherSet());

    _pos: Position;
    _digit: number;
    _allowed: CipherSet;

    constructor(pos: Position, value: number | undefined, allowed: CipherSet = new CipherSet(...Board.AllAllowed)) {
        this._pos = pos;
        if (value == undefined) {
            this._digit = 0;
            this._allowed = allowed;
        } else {
            this._digit = value;
            this._allowed = new CipherSet(value)
        }
    }

    isUndefined(): boolean {
        return this === FieldContent.NoFieldContent;
    }

    get pos(): Position {
        return this._pos;
    }

    hasDigit(): boolean {
        return this._digit > 0;
    }

    isEmpty(): boolean {
        return this._digit === 0
    }

    get digit(): number {
        if (this._digit > 0) {
            return this._digit;
        }
        throw new TypeError("This field contains no digit");
    }

    set digit(digit: number) {
        let newAllowed = CipherSet.BaseValue.get(digit);
        this._digit = digit;
        if (newAllowed != undefined) {
            this._allowed.setDigit(newAllowed);
        }
    }

    get value(): string {
        if (this.hasDigit()) {
            return "" + this.digit;
        }
        return "empty";
    }

    set value(newValue: string) {
        this._digit = Number.parseInt(newValue);        
    }

    getDigitString(): string {
        if (this.hasDigit()) {
            return this._digit.toString();
        }
        return "";
    }

    get allowSet(): CipherSet {
        return this._allowed;
    }

    setAllowSet(cs: CipherSet) {
        this._allowed = cs;
    }

    allows(digit: number): boolean {
        // logAllowOccurrenceContent(this._pos, this._allowed);
        return this._allowed.contains(digit);        
    }

    get allowSetLength(): number {
        if (this.hasDigit()) {
            return 0;
        }
        return this._allowed.length;        
    }

    copy(): FieldContent {
        return new FieldContent(this.pos, this._digit);
    }

    toString(): string {
        var s = this._pos.toString();
        if (this.isEmpty()) {
            s += ": " + this.allowSet.toListString();
        } else {
            s += " = " + this.digit;
        }
        return s;
    }
}
