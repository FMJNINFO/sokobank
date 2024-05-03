import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";
import { Board, BoardError } from "../model/sudoku/board";
import { loggingActive } from "../model/sudoku/logger";
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

    _editorPos: Position;
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

        this._editorPos = Position.NoPosition;
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

    showHint(isHintVisible: boolean): void {
        this._isHintVisible = isHintVisible;
        this.showHint$.emit(isHintVisible);
    }

    showDigits(areDigitsVisible: boolean): void {
        this._areDigitsVisible = areDigitsVisible;
        this.showDigits$.emit(areDigitsVisible);
    }

    isHintVisible(): boolean {
        return this._isHintVisible;
    }

    areDigitsVisible(): boolean {
        return this._areDigitsVisible;
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

    #isBoardFull(): boolean {
        return this._board.isFull();
    }

    #hasBoardErrors(): boolean {
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

    fillComplete() {
        let doLogging = true;

        if (!this._board.isFull()) {
            let solver = new Solver(this._solverMemory);
            let [isSolved, steps] = solver.findAllResolvingSteps(this._board);
            if (!isSolved) {
                if (doLogging && loggingActive) {
                    console.log("Found no solution");
                }
                return;
            }
            for (let step of steps) {
                this._board.addStep(step);
            }
        }
    }

    #evaluationMapToText(evalMap: Map<Cause, number>): string {
        let n1, n2, n3: number;
        let s = "";

        n1 = (evalMap.has(Cause.TRIAL_CIPHER) ? evalMap.get(Cause.TRIAL_CIPHER)! : 0)
          + (evalMap.has(Cause.ANY_CIPHER) ? evalMap.get(Cause.ANY_CIPHER)! : 0);
        n2 = (evalMap.has(Cause.UNIQUE_CIPHER) ? evalMap.get(Cause.UNIQUE_CIPHER)! : 0);
        n3 = (evalMap.has(Cause.LONELY_CIPHER) ? evalMap.get(Cause.LONELY_CIPHER)! : 0);

        s += (n1.toString().padStart(2, '0'));
        s += '.';
        s += (n2.toString().padStart(2, '0'));
        s += '.';
        s += (n3.toString().padStart(2, '0'));
        return s;
    }

    evaluate(): [boolean, boolean, string] {
        let solver = new Solver(this._solverMemory);
        let isSolved1 = false;
        let isSolved2 = false;
        let solvedBoard: Board;

        [isSolved1, solvedBoard] = solver.getResolvedBoard(this._board);
        let solution1 = solvedBoard.contentToString();
        let sumCauses1 = Step.summarizeCauses(Step.compress(solvedBoard._steps));

        [isSolved2, solvedBoard] = solver.getResolvedBoard(this._board, true);
        let solution2 = solvedBoard.contentToString();
        let sumCauses2 = Step.summarizeCauses(Step.compress(solvedBoard._steps));

        if (isSolved1 != isSolved2) {
            throw new BoardError("The two evaluation resolutions yields different solve states.");
        }

        if (loggingActive) {
            console.log("SOLUTION1: " + solution1);
            console.log("SOLUTION2: " + solution2);
        }

        let s1 = this.#evaluationMapToText(sumCauses1);
        let s2 = this.#evaluationMapToText(sumCauses2);

        let isSolved = isSolved2;
        let isUnique = solution1 == solution2;
        let value = (s1 < s2 ? s1 : s2);

        if (loggingActive) {
            console.log();
            console.log("Evaluation 1: " + s1);
            console.log("Evaluation 2: " + s2);

            console.log(" ==> " + (s1 < s2 ? s1 : s2));
        }

        return [isSolved, isUnique, value];
    }

    setDigit(pos: Position, digit: number, cause: Cause) {
        let step = new Step(cause, pos, digit);
        this._board.addStep(step);
        this.findAllCheats();
    }

    set digitEditorPos(pos: Position) {
        this._editorPos = pos;
        console.log("Current edit position: " + this._editorPos.toString());
    }

    get digitEditorPos(): Position {
        return this._editorPos;
    }

    isDigitEditing(): boolean {
        return !this._editorPos.equals(Position.NoPosition);
    }

    stopDigitEditing() {
        this._editorPos = Position.NoPosition;
    }

    hasError(pos: Position): boolean {
        return this._board.hasError(pos);
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

    isFillCompleteAllowed(): boolean {
        return !this.#isBoardFull() && !this.#hasBoardErrors() && this._board.hasMinimalDigitCount();
    }
}