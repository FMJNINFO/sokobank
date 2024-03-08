import { CipherSet } from "./cipherset";
import { Cause, FieldContent } from "./fieldContent";
import { logBoardEvaluationContent, logBoardEvaluationHeader } from "./logger";
import { Move } from "./move";
import { Position } from "./position";

export class BoardError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BoardError";
    }
}

export class Board {
    static AllAllowed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    static EmptyAllowedSet = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    static AllFieldIndices = [...Array(81).keys()];

    _fields: Map<Position, FieldContent> = new Map();
    _errors: Set<Position> = new Set();
    _marked: Set<Position> = new Set();
    _initializing = true;

    constructor() {
        this.startInitialize()
    }

    startInitialize(): void {
        this._initializing = true;
        let pos: Position;
        for (let iPos = 0; iPos < 81; iPos++) {
            pos = Position.of(iPos);
            this._fields.set(pos, new FieldContent(new Move(pos), new CipherSet(...Board.AllAllowed)));
        }
    }

    stopInitialize(): void {
        this._initializing = false;
        this.#evaluateAll();
    }

    fieldContentOf(pos: Position): FieldContent {
        let field = this._fields.get(pos);
        if (field != undefined) {
            return field;
        }
        return FieldContent.NoFieldContent;
    }

    add(move: Move, cause: Cause) {
        let fieldContent = this.fieldContentOf(move.pos);
        if (!fieldContent.hasDigit() || fieldContent.digit() != move.digit) {
            this.fieldContentOf(move.pos).setDigit(move.digit, cause);
            for (let group of move.pos.groups) {
                this.#evaluateGroup(group);
            }
            this.#evaluateAt(move.pos);
            this._errors = this.#searchErrors();
        }
        this.unmark();
        if (this.hasErrors() && (cause !== Cause.ENTERED)) {
            throw new BoardError("Error adding move " + move.toString());
        }
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

    #searchErrors(): Set<Position> {
        let errors: Set<Position> = new Set();
        let digits: number[];
        let unique: Set<number>;
        let fieldContents: FieldContent[];

        this._errors.clear();

        this.fieldContentsOf(Position.pool())
            .filter((fc) => !fc.hasDigit())
            .filter((fc) => fc.allowSet.isEmpty())
            .forEach((fc) => errors.add(fc.pos));

        for (let grp of Position.allGrps()) {
            fieldContents = this.fieldContentsOf(grp).filter((fc) => fc.hasDigit());
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

    fieldContents(): FieldContent[] {
        return Array.from(this._fields.values());
    }

    emptyFieldContents(): FieldContent[] {
        let emptyFcs = this.fieldContents().filter((fc) => fc.isEmpty());
        return emptyFcs;
    }

    #allowedInGroup(group: Position[]): CipherSet {
        let used = this.fieldContentsOf(group).filter((fc) => fc.hasDigit()).map((fc) => fc.digit());
        let cs = new CipherSet(...used);
        let ret = cs.not(); 
        return ret;
    }

    #allowedInField(pos: Position): CipherSet {
        let allowed = CipherSet.ofAll();
        for (let grp of pos.groups) {
            allowed = allowed.and(this.#allowedInGroup(grp));
        }

        return allowed;
    }

    getDigit(pos: Position | number): number {
        if (typeof pos == 'number') {
            pos = Position.of(pos);
        }
        return this.fieldContentOf(pos).digit();
    }

    #evaluateAt(pos: Position): void {
        let fieldContent = this.fieldContentOf(pos);
        if (fieldContent.isEmpty()) {
            fieldContent.setAllowSet(this.#allowedInField(pos));
        }
        logBoardEvaluationContent(fieldContent);
    }

    #evaluateGroup(group: Position[]) {
        if (!this._initializing) {
            logBoardEvaluationHeader();

            for (let pos of group) {
                this.#evaluateAt(pos);
            }
        }
    }

    #evaluateAll() {
        this.#evaluateGroup(Position.pool())
    }

    emptyFieldCount(): number {
        let count = this.fieldContentsOf(Position.pool()).filter((fc) => !fc.hasDigit()).length;
        return count;
    }

    isFull(): boolean {
        let doLogging = false;
        let isFull = this.emptyFieldCount() == 0;
        if (isFull && doLogging) {
            let pos: Position;
            let cause: Cause;
            console.log("=== FULL BOARD ===");
            for (let fc of this._fields.values()) {
                pos = fc.pos;
                cause = fc.cause();
                console.log(pos.toString() + ": " + fc._move._digit + "   BY " + cause);
            }
        }
        return isFull;
    }

    copy(): Board {
        let copy = new Board();
        for (let fc of this._fields.values()) {
            copy.add(fc.getMove(), fc.cause());
        }
        copy.stopInitialize();
        return copy;
    }

    fieldContentsOf(poss: Position[]): FieldContent[] {
        let fields = []
        for (let ipos of poss) {
            fields.push(this.fieldContentOf(ipos));
        }
        return fields;
    }

    contentToString(): string {
        let s = "";
        let digit: number;
        for (let iPos = 0; iPos < 81; iPos++) {
            digit = this.getDigit(iPos);
            if (digit <= 0) {
                s += Move.SpaceChar;
            } else {
                s += digit;
            }
        }
        return s;
    }
}
