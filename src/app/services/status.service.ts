import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";
import { Board } from "../model/sudoku/board";
import { logBoard } from "../model/sudoku/logger";
import { Move } from "../model/sudoku/move";
import { Solver } from "../model/sudoku/solver";
import { Cause } from "../model/sudoku/fieldContent";

export class StatusService {
    shouldEdit$: EventEmitter<Position>;
    showHint$: EventEmitter<boolean>;
    showDigits$: EventEmitter<boolean>;
    boardChanged$: EventEmitter<Board>;

    _editor: Position;
    _isHintVisible: boolean;
    _areDigitsVisible: boolean;
    _board: Board;

    constructor() {
        this.shouldEdit$ = new EventEmitter();
        this.showHint$ = new EventEmitter();
        this.showDigits$ = new EventEmitter();
        this.boardChanged$ = new EventEmitter();

        this._editor = Position.NoPosition;
        this._isHintVisible = false;
        this._areDigitsVisible = false;
        this._board = new Board();
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

    setBoardByMoves(moves: Move[], cause: Cause) {
        this._board.startInitialize();
        for (let move of moves) {
            this._board.add(move, cause);
        }
        this._board.stopInitialize();
    }

    markAllLonelyCiphers(): void {
        let doLogging = true;
        let solver = new Solver();

        let moves = solver.findAllLonelyCiphers(this._board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Lonely cipher: " + move.toString())
            }
            console.log("-- Find Lonely Cipher done.")
        }
        this._board.mark(new Set(moves.map((m) => m.pos)));
    }

    fillLonelyCiphers(): void {
        let solver = new Solver();

        let moves = solver.findAllLonelyCiphers(this._board);
        for (let move of moves) {
            if (move.hasDigit()) {
                this._board.add(move, Cause.LONELY_CIPHER);
            }
        }
    }

    markUniqueCiphers() {
        let doLogging = true;
        let solver = new Solver();

        let moves = solver.findAllUniqueCiphers(this._board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Found unique cipher: " + move.toString());
            }
            console.log("-- Find Unique Cipher done.")
        }
        this._board.mark(new Set(moves.map((m) => m.pos)));
    }

    fillUniqueCiphers() {
        let solver = new Solver();
        let moves = solver.findAllUniqueCiphers(this._board);
        for (let move of moves) {
            if (move.hasDigit()) {
                this._board.add(move, Cause.UNIQUE_CIPHER);
            }
        }
    }

    markClosedGroup() {
        let solver = new Solver();
        let closedGroup = solver.findBestClosedGroup(this._board);

        if (closedGroup === undefined) {
            this._board.unmark()
        } else {
            this._board.mark(closedGroup.asSet())
        }
    }

    cleanClosedGroup() {
        let solver = new Solver();
        let closedGroup = solver.findBestClosedGroup(this._board);

        if (closedGroup !== undefined) {
            closedGroup.apply(this._board);
            this._board.unmark();
            this.markClosedGroup();
        }
    }

    fillAutomatic() {
        let solver = new Solver();
        solver.solve(this._board);
    }

    solveComplete(): boolean {
        let solver = new Solver();
        solver.solveComplete(this._board);
        return false;
    }

    markBestTrialMove(): boolean {
        if (this._board.emptyFieldCount() > 60) {
            return false;
        }
        let doLogging = true;
        let solver = new Solver();
        let moves = solver.findAllResolvingMoves(this._board);
        if (moves.length == 0) {
            if (doLogging) {
                console.log("Found no solution")
            }
            return false;
        }
        if (doLogging) {
            console.log("Found resolving moves at:")
            for (let move of moves) {
                console.log("   " + move.toString())
            }
        }
        this._board.mark(new Set(moves.map((m) => m.pos)));
        return true;
    }    

    fillBestTrialMove(): boolean {
        let doLogging = true;
        let solver = new Solver();
        let moves = solver.findAllResolvingMoves(this._board);
        if (moves.length == 0) {
            if (doLogging) {
                console.log("Found no solution");
            }
            return false;
        }
        this._board.add(moves[0], Cause.TRIAL_CIPHER);
        return true;
    }    

    getBoxDigit(boxId: number, idInBox: number): number {
        return this._board.getDigit(Position.box(boxId)[idInBox]);
    }

    setDigit(pos: Position, digit: number, cause: Cause) {
        let move = new Move(pos, digit);
        this._board.add(move, cause);
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
}