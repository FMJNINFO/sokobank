

export class SubArray {
    _count: number;
    _subsize: number;
    _current: Array<number> | undefined;
    _next: Array<number> | undefined;

    constructor(count: number, subsize: number) {
        if (subsize > count) {
            throw new Error("Count must be at least at large as subsize, but subsize " 
                + subsize.toString() + " > count " + count.toString());
        }
        if (subsize <= 0) {
            throw new Error("A subsize of " + subsize.toString() + " is senseless (must be greater as 0).");
        }
        this._count = count;
        this._subsize = subsize;
        this._next = this._initNext();
    }

    _initNext(): Array<number> {
        var next = new Array<number>();
        for (var i=0; i<this._subsize; i++) {
            next.push(i);
        }
        return next;
    }

    next(): Array<number> | undefined {
        if (this._next != undefined) {
            if (this._next[this._subsize-1] >= this._count) {
                this._next = undefined;
            }
        }
        if (this._next == undefined) {
            return this._next;
        }
        this._current = this._next.slice();        
        this._calculateNext(this._next);
        return this._current;
    }

    _calculateNext(current: Array<number>, depth: number=0): boolean {
        if (depth < this._subsize-1) {
            if (this._calculateNext(current, depth+1)) {
                return true;
            }
        }
        if (current[depth] >= this._count) {
            if (depth == 0) {
                return false;
            }
            current[depth] = current[depth-1];
        }
        current[depth] += 1;
        if (current[depth] < this._count) {
            if (depth < this._subsize-1) {
                if (this._calculateNext(current, depth+1)) {
                    return true;
                }
                if (depth == 0) {
                    if (current[depth] >= this._count) {
                        return false;
                    } else {
                        return this._calculateNext(current, depth+1);
                    }
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
