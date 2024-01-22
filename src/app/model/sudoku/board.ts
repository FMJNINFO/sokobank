import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { logBoardEvaluationContent, logBoardEvaluationHeader } from "./logger";
import { Move } from "./move";
import { Position } from "./position";


export class Board {
    static AllAllowed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    static EmptyAllowedSet = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    static AllFieldIndices = [...Array(81).keys()];
    _fields: Map<Position, FieldContent> = new Map();
    _errors: Set<Position> = new Set();
    initializing = true;

    constructor() {
        let pos: Position;
        for (let iPos = 0; iPos < 81; iPos++) {
            pos = Position.of(iPos);
            this._fields.set(pos, new FieldContent(pos, undefined, new CipherSet(...Board.AllAllowed)));
        }
    }

    stopInitialize(): void {
        this.initializing = false;
        this.evaluateAll();
    }

    fieldContent(pos: Position): FieldContent {
        let field = this._fields.get(pos);
        if (field != undefined) {
            return field;
        }
        return FieldContent.NoFieldContent;
    }

    add(move: Move) {
        let fieldContent = this.fieldContent(move.pos);
        if (!fieldContent.hasDigit() || fieldContent.digit != move.digit) {
            this.fieldContent(move.pos).digit = move.digit;
            for (let group of move.pos.groups) {
                this.evaluateGroup(group);
            }
            this.evaluateAt(move.pos);
        }
    }

    set(pos: Position, content: number) {
        let fieldContent = this.fieldContent(pos);
        if (!fieldContent.hasDigit() || fieldContent.digit != content) {
            this.fieldContent(pos).digit = content;
            for (let group of pos.groups) {
                this.evaluateGroup(group);
            }
            this.evaluateAt(pos);
            this.lookForErrors();
        }
    }

    fields(): Position[] {
        return Array.from(this._fields.keys());
    }

    hasErrors(): boolean {
        return this._errors.size > 0;
    }

    hasError(pos: Position): boolean {
        return this._errors.has(pos);
    }

    lookForErrors() {
        var digits: number[];
        var unique: Set<number>;
        var fieldContents: FieldContent[];

        this._errors.clear();

        this.fieldContents(Position.pool())
            .filter((fc) => !fc.hasDigit())
            .filter((fc) => fc.allowSet.isEmpty())
            .forEach((fc) => this._errors.add(fc.pos));

        for (let grp of Position.allGrps()) {
            fieldContents = this.fieldContents(grp).filter((fc) => fc.hasDigit());
            digits = fieldContents.map((fc) => fc.digit);
            unique = new Set(digits);
            if (digits.length != unique.size) {
                for (let digit of digits) {
                    if (digits.indexOf(digit) != digits.lastIndexOf(digit)) {
                        fieldContents
                            .filter((fc) => fc.digit == digit)
                            .forEach((fc) => this._errors.add(fc.pos));
                    }
                }
            }            
        }
        if (this._errors.size > 0) {
            let s = ""
            for (let pos of this._errors) {
                let fc = this.fieldContent(pos);
                if (s.length > 0)
                    s += ", "
                s += fc.toString();
                console.log("Errors in " + s);
            }
        }        
    }

    allFieldContents(): FieldContent[] {
        return Array.from(this._fields.values());
    }

    allEmptyFieldContents(): FieldContent[] {
        var emptyFcs = this.allFieldContents()
            .filter((fc) => fc.isEmpty());
        return emptyFcs;
    }

    allowedInGroup(group: Position[]): CipherSet {
        var used = [];

        used= this.fieldContents(group)
        .filter((fc) => fc.hasDigit())
        .map((fc) => fc.digit);

        var cs = new CipherSet(...used);
        var ret = cs.not(); 
        return ret;
    }

    allowedInField(pos: Position): CipherSet {
        var allowed = CipherSet.ofAll();
        for (let grp of pos.groups) {
            allowed = allowed.and(this.allowedInGroup(grp));
        }

        return allowed;
    }

    evaluateAt(pos: Position): void {
        var fieldContent = this.fieldContent(pos);
        if (fieldContent.isEmpty()) {
            fieldContent.setAllowSet(this.allowedInField(pos));
        }
        logBoardEvaluationContent(fieldContent);
    }

    evaluateGroup(group: Position[]) {
        if (!this.initializing) {
            logBoardEvaluationHeader();

            for (var pos of group) {
                this.evaluateAt(pos);
            }
        }
    }

    evaluateAll() {
        this.evaluateGroup(Position.pool())
    }

    emptyFields(): number {
        var count = 0;

        count = this.fieldContents(Position.pool())
                .filter((fc) => !fc.hasDigit())
                .length;
        return count;
    }

    isFull(): boolean {
        return this.emptyFields() == 0;
    }

    copy(): Board {
        var copy = new Board();
        var fieldContent: FieldContent;
        var pos: Position;
        for (let iPos = 0; iPos < 81; iPos++) {
            pos = Position.of(iPos)
            fieldContent = this.fieldContent(pos)
            copy._fields.set(pos, fieldContent.copy());
        }
        return copy;
    }

    fieldContents(poss: Position[]): FieldContent[] {
        var fields = []
        for (let ipos of poss) {
            fields.push(this.fieldContent(ipos));
        }
        return fields;
    }    
}
