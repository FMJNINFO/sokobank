import { Cause } from "./cause";
import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { logBoardEvaluationContent, logBoardEvaluationHeader } from "./logger";
import { Move } from "./move";
import { Position } from "./position";
import { Step } from "./step";

export interface Cheat {
    apply: (board: Board) => void;
    affectedBy: (pos: Position) => boolean;
    cause: Cause;
}    

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

    _steps: Step[] = [];
    _plans: Step[] = [];
    _fields: Map<Position, FieldContent> = new Map();
    _errors: Set<Position> = new Set();
    _marked: Set<Position> = new Set();
    _markedCheat: Cheat | undefined = undefined ;
    _initializing = false;

    constructor() {
        // this.startInitialize()
        this.reset();
    }

    addSteps(steps: Step[]) {
        for (let step of steps) {
            this.addStep(step);
        }
    }

    addStep(step: Step) {
        this.#step(step._move.pos, step._move.digit, step._cause);
        this._steps.push(step);
    }

    addPlans(steps: Step[]) {
        for (let step of steps) {
            this.addPlan(step);
        }
    }

    addPlan(step: Step) {
        this._plans.push(step);
    }

    planToStep() {
        let step = this._plans.pop();
        if (step !== undefined) {
            this.addStep(step);
        }
    }

    #step(pos: Position, digit: number, cause: Cause): void {
        let fieldContent = this.fieldContentOf(pos);
        if (!fieldContent.hasDigit() || fieldContent.digit() != digit) {
            this.fieldContentOf(pos).setDigit(digit, cause);
            for (let group of pos.groups) {
                this.#evaluateGroup(group);
            }
            this.#evaluateAt(pos);
            this._errors = this.#searchErrors();
        }
        this.unmarkCheat();
        if (this.hasErrors() && (cause !== Cause.ENTERED)) {
            throw new BoardError("Error adding digit " + digit + " at " + pos.toString() + " by " + cause);
        }
    }

    startInitialize(): void {
        this._initializing = true;
        this.reset();
    }

    reset(): void {
        this._steps = [];
        this._plans = [];
        let pos: Position;
        for (let iPos = 0; iPos < 81; iPos++) {
            pos = Position.of(iPos);
            this._fields.set(pos, new FieldContent(pos, new CipherSet(...Board.AllAllowed)));
        }
        this.#evaluateAll();
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

    markCheat(cheat: Cheat | undefined) {
        this._markedCheat = cheat;
    }

    applyCheat() {
        if (this._markedCheat !== undefined) {
            this._markedCheat.apply(this);
            this._markedCheat = undefined;
        }
    }

    hasCheat(): boolean {
        return this._markedCheat !== undefined;
    }

    unmarkCheat() {
        this._markedCheat = undefined;
    }

    isMarked(pos: Position): boolean {
        if (this._markedCheat === undefined) {
            return false;
        }
        return this._markedCheat.affectedBy(pos);
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
        for (let step of this._steps) {
            copy.addStep(step);
        }
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
