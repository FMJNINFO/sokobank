import { CipherSet } from "./cipherset";
import { CoordValue, Evaluator } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { logBoardEvaluationContent, logBoardEvaluationHeader } from "./logger";


export class Board {
    static AllAllowed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    static EmptyAllowedSet = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    _fields: Array<FieldContent> = [];
    evaluator = new Evaluator();
    initializing = true;

    constructor() {
        for (let iPos = 0; iPos < 81; iPos++) {
            this._fields[iPos] = new FieldContent(iPos, new CipherSet(...Board.AllAllowed));
        }
    }

    stopInitialize(): void {
        this.initializing = false;
        this.evaluate();
    }

    field(pos: number): FieldContent {
        return this._fields[pos];
    }

    set(row: number, col: number, content: number) {
        let iPos = Evaluator.rowColAsPos(row, col);
        this.field(iPos).digit = content;
        if (!this.initializing) {
            this.evaluate();
        }
    }

    setByCoordValue(value: CoordValue) {
        console.log("[" + value.coord.row + "," + value.coord.col + "] = " + value.value);
        let iPos = Evaluator.rowColAsPos(value.coord.row, value.coord.col);
        this.field(iPos).digit = value.value;
        if (!this.initializing) {
            this.evaluate();
        }
    }

    setByCoordValues(values: Array<CoordValue>) {
        for (var value of values) {
            console.log("[" + value.coord.row + "," + value.coord.col + "] = " + value.value);
            let iPos = Evaluator.rowColAsPos(value.coord.row, value.coord.col);
            this.field(iPos).digit = value.value;
            if (!this.initializing) {
                this.evaluate();
            }
        }
    }

    _allowedInGroup(group: Array<number>): CipherSet {
        var used = [];
        var field: FieldContent;
        for (var iPos of group) {
            field = this.field(iPos);
            if (field.hasDigit()) {
                used.push(field.digit);
            }
        }
        var cs = new CipherSet(...used);
        var ret = cs.not(); 
        return ret;
    }

    _allowedInField(iPos: number): CipherSet {
        var coord = Evaluator.coord(iPos);
        var allowed = this._allowedInGroup(this.evaluator.getRow(coord));
        allowed = allowed.and(this._allowedInGroup(this.evaluator.getCol(coord)));
        allowed = allowed.and(this._allowedInGroup(this.evaluator.getBox(coord)));

        return allowed;
    }

    _evaluateAt(pos: number): void {
        var field = this.field(pos);
        if (field.hasAllowSet()) {
            field.setAllowSet(this._allowedInField(pos));
        }
        logBoardEvaluationContent(field);
    }

    evaluate() {
        logBoardEvaluationHeader();

        for (var iPos=0; iPos<81; iPos++) {
            this._evaluateAt(iPos);
        }
    }

    unfilledFieldCount(): number {
        var count = 0;
        for (let iPos = 0; iPos < 81; iPos++) {
            if (this.field(iPos).hasAllowSet()) {
                count += 1;
            }
        }
        return count;
    }

    isFull(): boolean {
        for (let iPos = 0; iPos < 81; iPos++) {
            if (this.field(iPos).hasAllowSet()) {
                return false;
            }
        }
        return true;
    }

    copy(): Board {
        var copy = new Board();
        for (let iPos = 0; iPos < 81; iPos++) {
            copy._fields[iPos] = this.field(iPos).copy();
        }
        return copy;
    }

    fields(poslist: Array<number>): Array<FieldContent> {
        var fields = []
        for (let ipos of poslist) {
            fields.push(this.field(ipos));
        }
        return fields;
    }
}    
