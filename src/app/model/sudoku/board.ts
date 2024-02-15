import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { logBoardEvaluationContent, logBoardEvaluationHeader } from "./logger";
import { Move } from "./move";
import { Position } from "./position";


export class Board {
    static AllAllowed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    static EmptyAllowedSet = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    static AllFieldIndices = [...Array(81).keys()];
    static AllowedChars = "123456789";
    static SpaceChar = ".";

    _fields: Map<Position, FieldContent> = new Map();
    _errors: Set<Position> = new Set();
    _marked: Set<Position> = new Set();
    _initializing = true;

    constructor() {
        let pos: Position;
        for (let iPos = 0; iPos < 81; iPos++) {
            pos = Position.of(iPos);
            this._fields.set(pos, new FieldContent(new Move(pos), new CipherSet(...Board.AllAllowed)));
        }
    }

    startInitialize(): void {
        this._initializing = true;
    }

    stopInitialize(): void {
        this._initializing = false;
        this._evaluateAll();
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
        if (!fieldContent.hasDigit() || fieldContent.digit() != move.digit) {
            this.fieldContent(move.pos).setDigit(move.digit);
            for (let group of move.pos.groups) {
                this._evaluateGroup(group);
            }
            this._evaluateAt(move.pos);
            this._errors = this._searchErrors();
        }
        this.unmark();
    }

    mark(marks: Set<Position>): void {
        this._marked = marks;
    }

    unmark(): void {
        this._marked.clear();
    }

    isMarked(pos: Position): boolean {
        return this._marked.has(pos);
    }

    _searchErrors(): Set<Position> {
        var errors: Set<Position> = new Set();
        var digits: number[];
        var unique: Set<number>;
        var fieldContents: FieldContent[];

        this._errors.clear();

        this.fieldContents(Position.pool())
            .filter((fc) => !fc.hasDigit())
            .filter((fc) => fc.allowSet.isEmpty())
            .forEach((fc) => errors.add(fc.pos));

        for (let grp of Position.allGrps()) {
            fieldContents = this.fieldContents(grp).filter((fc) => fc.hasDigit());
            digits = fieldContents.map((fc) => fc.digit());
            unique = new Set(digits);
            if (digits.length != unique.size) {
                for (let digit of digits) {
                    if (digits.indexOf(digit) != digits.lastIndexOf(digit)) {
                        fieldContents
                            .filter((fc) => fc.digit() == digit)
                            .forEach((fc) => errors.add(fc.pos));
                    }
                }
            }            
        }
        return errors;
    }

    hasError(pos: Position): boolean {
        return this._errors.has(pos);
    }

    hasErrors(): boolean {
        return this._errors.size > 0;
    }

    allFieldContents(): FieldContent[] {
        return Array.from(this._fields.values());
    }

    allEmptyFieldContents(): FieldContent[] {
        var emptyFcs = this.allFieldContents()
            .filter((fc) => fc.isEmpty());
        return emptyFcs;
    }

    _allowedInGroup(group: Position[]): CipherSet {
        var used = [];

        used= this.fieldContents(group)
        .filter((fc) => fc.hasDigit())
        .map((fc) => fc.digit());

        var cs = new CipherSet(...used);
        var ret = cs.not(); 
        return ret;
    }

    _allowedInField(pos: Position): CipherSet {
        var allowed = CipherSet.ofAll();
        for (let grp of pos.groups) {
            allowed = allowed.and(this._allowedInGroup(grp));
        }

        return allowed;
    }

    public getDigit(pos: Position | number): number {
        if (typeof pos == 'number') {
            pos = Position.of(pos);
        }
        return this.fieldContent(pos).digit();
    }

    _evaluateAt(pos: Position): void {
        var fieldContent = this.fieldContent(pos);
        if (fieldContent.isEmpty()) {
            fieldContent.setAllowSet(this._allowedInField(pos));
        }
        logBoardEvaluationContent(fieldContent);
    }

    _evaluateGroup(group: Position[]) {
        if (!this._initializing) {
            logBoardEvaluationHeader();

            for (var pos of group) {
                this._evaluateAt(pos);
            }
        }
    }

    _evaluateAll() {
        this._evaluateGroup(Position.pool())
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

    contentToString(): string {
        let s = "";
        let digit: number;
        for (let iPos = 0; iPos < 81; iPos++) {
            digit = this.getDigit(iPos);
            if (digit <= 0) {
                s += Board.SpaceChar;
            } else {
                s += digit;
            }
        }
        return s;
    }
}
