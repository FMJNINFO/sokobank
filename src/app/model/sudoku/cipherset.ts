

export class CipherSet {
    static zeroes = "000000000";
    static ones = "111111111";
    static allOnes = 511;
    static chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    static numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    static BaseValue = new Map<number, number>(
        [[1, 1], [2, 2], [3, 4], [4, 8], [5, 16], [6, 32], [7,64], [8, 128], [9, 256]]);
    _digit = 0;
    _length = 0;

    static fullCipherSet(): CipherSet {
        return new CipherSet(1,2,3,4,5,6,7,8,9);
    }

    constructor(...ciphers: number[]) {
        var cipher: number;
        var value: number | undefined;
        var joinedValue = 0;
        for (cipher of ciphers) {
            if (CipherSet.BaseValue.has(cipher)) {
                value = CipherSet.BaseValue.get(cipher);
                if (value != undefined) {
                    joinedValue |= value;
                }
            }
        }
        this.setDigit(joinedValue);
    }

    toString(): string {
        var s = CipherSet.zeroes + this._digit.toString(2);
        return s.substring(s.length-9);
    }

    toListString(): string {
        var s = "";
        var cs = this._digit;
        var val = 1;
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
        return this._digit === 0;
    }

    or(cs: CipherSet): CipherSet {
        var ret = new CipherSet();
        ret.setDigit(this._digit | cs.digit);
        return ret;
    }

    and(cs: CipherSet): CipherSet {
        var ret = new CipherSet();
        ret.setDigit(this._digit & cs.digit);
        return ret;
    }

    not(): CipherSet {
        var ret = new CipherSet();
        ret.setDigit(~this.digit & CipherSet.allOnes);
        return ret;
    }

    contains(digit: number): boolean {
        var digitBits = CipherSet.BaseValue.get(digit);
        if (digitBits != undefined) {
            return (this._digit & digitBits) != 0;
        }
        return false;
    }

    subset(cs: CipherSet): boolean {
        var intersection = this.and(cs);
        return this.length == intersection.length;
    }

    get length(): number {
        return this._length;
    }

    get entries(): number[] {
        var entries = [];
        var cs = this._digit;
        var val = 1;
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
        var cs = this._digit;
        var val = 0;
        while (cs > 0) {
            if ((cs & 1) > 0) {
                frequency[val] += 1
            }
            val = val + 1;
            cs = cs >> 1;
        }
        return frequency;
    }

    get digit(): number {
        return this._digit;
    }

    setDigit(digit: number) {
        this._digit = digit;
        this._length = 0;
        while (digit > 0) {
            if ((digit & 1) > 0) {
                this._length += 1;
            }
            digit = digit >> 1;
        }
    }

    get value(): string {
        return CipherSet.chars[this._digit];
    }

    static ofAll(): CipherSet {
        var ret = new CipherSet();
        ret.setDigit(CipherSet.allOnes);
        return ret;
    }
}