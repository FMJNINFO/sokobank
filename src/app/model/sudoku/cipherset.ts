

export class CipherSet {
    static zeroes = "000000000";
    static ones = "111111111";
    static onesValue = 511;
    static BaseValue = new Map<number, number>(
        [[1, 1], [2, 2], [3, 4], [4, 8], [5, 16], [6, 32], [7,64], [8, 128], [9, 256]]);
    _value = 0;
    _length = 0;

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
        this.setValue(joinedValue);
    }

    toString(): string {
        var s = CipherSet.zeroes + this.value.toString(2);
        return s.substring(s.length-9);
    }

    toListString(): string {
        var s = "";
        var cs = this.value;
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

    or(cs: CipherSet): CipherSet {
        var ret = new CipherSet();
        ret.setValue(this.value | cs.value);
        return ret;
    }

    and(cs: CipherSet): CipherSet {
        var ret = new CipherSet();
        ret.setValue(this.value & cs.value);
        return ret;
    }

    not(): CipherSet {
        var ret = new CipherSet();
        ret.setValue(~this.value & CipherSet.onesValue);
        return ret;
    }

    contains(digit: number): boolean {
        var digitBits = CipherSet.BaseValue.get(digit);
        if (digitBits != undefined) {
            return (this.value & digitBits) != 0;
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
        var cs = this.value;
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

    get value(): number {
        return this._value;
    }

    setValue(value: number) {
        this._value = value;
        this._length = 0;
        while (value > 0) {
            if ((value & 1) > 0) {
                this._length += 1;
            }
            value = value >> 1;
        }
    }

    static
    deepCopy(cipherSet: CipherSet): CipherSet {
        var copy = new CipherSet(...cipherSet.entries);
        return copy;
    }
}