import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";
import { Board } from "../model/sudoku/board";
import { logBoard } from "../model/sudoku/logger";
import { Move } from "../model/sudoku/move";
import { Solver } from "../model/sudoku/solver";
import { SolverMemory } from "../model/sudoku/solverMemory";
import { Step } from "../model/sudoku/step";
import { Cause } from "../model/sudoku/cause";

export class StatusService {
    shouldEdit$: EventEmitter<Position>;
    showHint$: EventEmitter<boolean>;
    showDigits$: EventEmitter<boolean>;
    boardChanged$: EventEmitter<Board>;

    _editor: Position;
    _isHintVisible: boolean;
    _areDigitsVisible: boolean;
    _board: Board;
    _emphasizedDigit: number | undefined;
    _solverMemory: SolverMemory;

    constructor() {
        this.shouldEdit$ = new EventEmitter();
        this.showHint$ = new EventEmitter();
        this.showDigits$ = new EventEmitter();
        this.boardChanged$ = new EventEmitter();

        this._editor = Position.NoPosition;
        this._isHintVisible = false;
        this._areDigitsVisible = false;
        this._board = new Board();
        this._solverMemory = new SolverMemory();
    }

    emphasizeDigit(digit: number) {
        if (this._emphasizedDigit == digit) {
            this._emphasizedDigit = undefined;
        } else {
            this._emphasizedDigit = digit;
        }
    }

    unemphasizeDigits() {
        this._emphasizedDigit = undefined;
    }

    isDigitEmphasized(digit: number): boolean {
        return digit == this._emphasizedDigit;
    }

    currentEditor(): Position {
        return this._editor;
    }
    shouldEdit(pos: Position): void {
        this._editor = pos;
        this.shouldEdit$.emit(pos);
    }
    onEditorChange(pos: Position): void {
        this._editor = pos;
        this.shouldEdit$.emit(pos);
    }

    showHint(isHintVisible: boolean): void {
        this._isHintVisible = isHintVisible;
        this.showHint$.emit(isHintVisible);
    }

    showDigits(areDigitsVisible: boolean): void {
        this._areDigitsVisible = areDigitsVisible;
        this.showDigits$.emit(areDigitsVisible);
    }

    onDigitVisibilityChanged(areDigitsVisible: boolean): void {
        this._areDigitsVisible = areDigitsVisible;
        this.showDigits$.emit(areDigitsVisible);
    }

    onHintVisibilityChanged(isHintVisible: boolean): void {
        this._isHintVisible = isHintVisible;
        this.showHint$.emit(isHintVisible);
    }

    isHintVisible(): boolean {
        return this._isHintVisible;
    }

    areDigitsVisible(): boolean {
        return this._areDigitsVisible;
    }

    getBoard(): Board {
        return this._board;
    }
    changeBoard(board: Board) {
        this._board = board;
        logBoard(this._board);
        console.log("");
        this.boardChanged$.emit(this._board);
    }

    getDigit(pos: Position): number {
        return this._board.fieldContentOf(pos).digit();
    }

    getBoardContentAsString(): string {
        return this._board.contentToString();
    }

    setBoardBySteps(steps: Step[]) {
        this._board.reset();
        this._board.addSteps(steps);
    }
    
    cleanBoard() {
        this._board.reset();
    }

    isBoardFull(): boolean {
        return this._board.isFull();
    }

    hasBoardErrors(): boolean {
        return this._board.hasErrors();
    }

    hasLonelyCipher(): boolean {
        return this._solverMemory.hasLonelyCipher();
    }

    hasUniqueCipher(): boolean {
        return this._solverMemory.hasUniqueCipher();
    }

    hasClosedGroup(): boolean {
        return this._solverMemory.hasClosedGroup();
    }

    findAllCheats(): void {
        let solver = new Solver(this._solverMemory);
        solver.findAllCheats(this._board);
    }

    markNextLonelyCipher(): void {
        let stepToMark = this._solverMemory.getNextLonelyCipher();
        this._board.markCheat(stepToMark);
    }

    markNextUniqueCipher(): void {
        let stepToMark = this._solverMemory.getNextUniqueCipher();
        this._board.markCheat(stepToMark);
    }

    markNextClosedGroup(): void {
        let groupToMark = this._solverMemory.getNextClosedGroup();
        this._board.markCheat(groupToMark);
    }

    hasCheat(): boolean {
        return this._board.hasCheat();
    }

    applyCheat(): void {
        this._board.applyCheat();
        this.findAllCheats();
    }

    solveComplete(): boolean {
        let solver = new Solver(this._solverMemory);
        solver.solveComplete(this._board);
        return false;
    }

    fillCompleteBroad() {
        let doLogging = true;

        while (!this._board.isFull()) {
            let solver = new Solver(this._solverMemory);
            let steps = solver.findAllResolvingStepsBroad(this._board);
            if (steps.length == 0) {
                if (doLogging) {
                    console.log("Found no solution");
                }
                return;
            }
            for (let step of steps) {
                this._board.addStep(step);
            }
        }
    }

    getBoxDigit(boxId: number, idInBox: number): number {
        return this._board.getDigit(Position.box(boxId)[idInBox]);
    }

    setDigit(pos: Position, digit: number, cause: Cause) {
        let step = new Step(cause, pos, digit);
        this._board.addStep(step);
    }

    hasError(pos: Position): boolean {
        return this._board.hasError(pos);
    }

    hasErrors(): boolean {
        return this._board.hasErrors();
    }

    isMarked(pos: Position): boolean {
        if (this._isHintVisible) {
            return this._board.isMarked(pos);
        }
        return false;
    }

    isAllowed(pos: Position, digit: number): boolean {
        return this._board.fieldContentOf(pos).allows(digit);
    }

    allowedChars(): string {
        return Move.AllowedChars;
    }

    spaceCharacter(): string {
        return Move.SpaceChar;
    }

    isCompleteSolutionProhibited(): boolean {
        return this.isBoardFull() || this.hasBoardErrors() || !this._board.hasMinimalDigitCount();
    }

    get evaluation(): [boolean|undefined, string] {
        let solver = new Solver(this._solverMemory);
        let solvable: boolean;
        let evaluation: Map<Cause, number>;

        if (this._board.hasErrors()) {
            return [false, "None, because there are errors on the board."];
        }
        if (this._board.emptyFieldCount() > 60) {
            return [undefined, "None, because too many empty fields."];
        }

        [solvable, evaluation] = solver.evaluate(this._board);

        let sEval = "";
        if (solvable) {
            let valTE =  evaluation.has(Cause.TRIAL_CIPHER) ? evaluation.get(Cause.TRIAL_CIPHER)! : 0;
            let valUC =  evaluation.has(Cause.UNIQUE_CIPHER) ? evaluation.get(Cause.UNIQUE_CIPHER)! : 0;
            let valLC =  evaluation.has(Cause.LONELY_CIPHER) ? evaluation.get(Cause.LONELY_CIPHER)! : 0;
            let valAll = valTE * 200 + valUC * 2 + valLC;

            sEval +=  "TE: " + valTE + " ";
            sEval +=  "UC: " + valUC + " ";
            sEval +=  "LC: " + valLC + " ";
            sEval +=  " => " + valAll;
        } else {
            sEval = "None, because there are inconsistencies on the board.";
        }
        return [solvable, sEval];
    }
}