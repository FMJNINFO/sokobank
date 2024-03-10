
export class CipherSet {
    static zeroes = "000000000";
    static allOnes = 511;
    static chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    static BaseValue = new Map<number, number>(
        [[1, 1], [2, 2], [3, 4], [4, 8], [5, 16], [6, 32], [7,64], [8, 128], [9, 256]]);

    _bitset = 0;
    _length = 0;

    static fullCipherSet(): CipherSet {
        return new CipherSet(1,2,3,4,5,6,7,8,9);
    }

    constructor(...digits: number[]) {
        let digit: number;
        let value: number | undefined;
        let joinedValue = 0;
        for (digit of digits) {
            if (CipherSet.BaseValue.has(digit)) {
                value = CipherSet.BaseValue.get(digit);
                if (value != undefined) {
                    joinedValue |= value;
                }
            }
        }
        this.#setBitset(joinedValue);
    }

    toString(): string {
        let s = CipherSet.zeroes + this._bitset.toString(2);
        return s.substring(s.length-9);
    }

    toListString(): string {
        let s = "";
        let cs = this._bitset;
        let val = 1;
        while (cs > 0) {
            if ((cs & 1) > 0) {
                s = s + (s.length>0 ? "," : "") + val;
            }
            val = val + 1;
            cs = cs >> 1;
        }
        return "(" + s + ")";
    }

    isEmpty(): boolean {
        return this._bitset === 0;
    }

    or(cs: CipherSet): CipherSet {
        let ret = new CipherSet();
        ret.#setBitset(this._bitset | cs._bitset);
        return ret;
    }

    and(cs: CipherSet): CipherSet {
        let ret = new CipherSet();
        ret.#setBitset(this._bitset & cs._bitset);
        return ret;
    }

    not(): CipherSet {
        let ret = new CipherSet();
        ret.#setBitset(~this._bitset & CipherSet.allOnes);
        return ret;
    }

    contains(digit: number): boolean {
        let digitBits = CipherSet.BaseValue.get(digit);
        if (digitBits != undefined) {
            return (this._bitset & digitBits) != 0;
        }
        return false;
    }

    get length(): number {
        return this._length;
    }

    get entries(): number[] {
        let entries = [];
        let cs = this._bitset;
        let val = 1;
        while (cs > 0) {
            if ((cs & 1) > 0) {
                entries.push(val);
            }
            val = val + 1;
            cs = cs >> 1;
        }
        return entries;
    }

    static
    emptyFrequency(): number[] {
        return [0,0,0,0,0,0,0,0,0];
    }

    addFrequency(frequency: number[] = CipherSet.emptyFrequency()): number[] {
        let cs = this._bitset;
        let val = 0;
        while (cs > 0) {
            if ((cs & 1) > 0) {
                frequency[val] += 1
            }
            val = val + 1;
            cs = cs >> 1;
        }
        return frequency;
    }

    #setBitset(digit: number) {
        this._bitset = digit;
        this._length = 0;
        while (digit > 0) {
            if ((digit & 1) > 0) {
                this._length += 1;
            }
            digit = digit >> 1;
        }
    }

    static ofAll(): CipherSet {
        let ret = new CipherSet();
        ret.#setBitset(CipherSet.allOnes);
        return ret;
    }
}