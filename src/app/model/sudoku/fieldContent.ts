import { CipherSet } from "./cipherset";
import { Evaluator } from "./evaluator";


export class FieldContent {
    _pos: number;
    _value: number | CipherSet;

    constructor(pos: number, value: number | CipherSet) {
        this._pos = pos;
        if (value == undefined) {
            this._value = new CipherSet();
        } else {
            this._value = value
        }
    }

    get pos(): number {
        return this._pos;
    }

    hasDigit(): boolean {
        return typeof this._value === "number";
    }

    get digit(): number {
        if (typeof this._value === "number") {
            return this._value;
        }
        throw new TypeError("This field contains no digit");
    }

    set digit(digit: number) {
        this._value = digit;
    }

    hasAllowSet(): boolean {
        return typeof this._value === "object";
    }

    get allowSet(): CipherSet {
        if (typeof this._value === "object") {
            return this._value;
        }
        throw new TypeError("This field contains no cipherset");
    }

    setAllowSet(cs: CipherSet) {
        this._value = cs;
    }

    allows(digit: number): boolean {
        if (typeof this._value !== "object") {
            throw new TypeError("This field already has a digit");
        }
        return this._value.contains(digit);        
    }

    get allowSetLength(): number {
        if (typeof this._value !== "object") {
            throw new TypeError("This field already has a digit");
        }
        return this._value.length;        
    }

    copy(): FieldContent {
        return new FieldContent(this.pos, this._value);
    }

    toString(): string {
        var coord = Evaluator.coord(this._pos);
        var s = "["+coord.row+","+coord.col+"]";
        if (this.hasDigit()) {
            s += " = " + this.digit;
        } else {
            s += ": " + this.allowSet.toListString();
        }
        return s;
    }
}
