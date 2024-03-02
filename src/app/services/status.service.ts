import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";
import { Board } from "../model/sudoku/board";
import { logBoard } from "../model/sudoku/logger";
import { Move } from "../model/sudoku/move";
import { Solver } from "../model/sudoku/solver";
import { Cause } from "../model/sudoku/fieldContent";

export class StatusService {
    public shouldEdit$: EventEmitter<Position>;
    public showHint$: EventEmitter<boolean>;
    public boardChanged$: EventEmitter<Board>;

    private _editor: Position;
    private _isHintVisible: boolean;
    private _board: Board;

    constructor() {
        this.shouldEdit$ = new EventEmitter();
        this.showHint$ = new EventEmitter();
        this.boardChanged$ = new EventEmitter();

        this._editor = Position.NoPosition;
        this._isHintVisible = false;
        this._board = new Board();
    }

    public currentEditor(): Position {
        return this._editor;
    }
    public shouldEdit(pos: Position): void {
        this._editor = pos;
        this.shouldEdit$.emit(pos);
    }
    public onEditorChange(pos: Position): void {
        this._editor = pos;
        this.shouldEdit$.emit(pos);
    }

    public showHint(isHintVisible: boolean): void {
        this._isHintVisible = isHintVisible;
        this.showHint$.emit(isHintVisible);
    }

    public onHintVisibilityChanged(isHintVisible: boolean): void {
        this._isHintVisible = isHintVisible;
        this.showHint$.emit(isHintVisible);
    }

    public isHintVisible(): boolean {
        return this._isHintVisible;
    }

    public getBoard(): Board {
        return this._board;
    }
    public changeBoard(board: Board) {
        this._board = board;
        logBoard(this._board);
        console.log("");
        this.boardChanged$.emit(this._board);
    }

    public getDigit(pos: Position): number {
        return this._board.fieldContent(pos).digit();
    }

    public getBoardContentAsString(): string {
        return this._board.contentToString();
    }

    public setBoardByMoves(moves: Move[], cause: Cause) {
        this._board.startInitialize();
        for (let move of moves) {
            this._board.add(move, cause);
        }
        this._board.stopInitialize();
    }

    public markAllLonelyCiphers(): void {
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

    public fillLonelyCiphers(): void {
        let solver = new Solver();

        let moves = solver.findAllLonelyCiphers(this._board);
        for (let move of moves) {
            if (move.hasDigit()) {
                this._board.add(move, Cause.LONELY_CIPHER);
            }
        }
    }

    public markUniqueCiphers() {
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

    public fillUniqueCiphers() {
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
            closedGroup.clean(this._board);
            this._board.unmark();
            this.markClosedGroup();
        }
    }

    fillAutomatic() {
        let solver = new Solver();
        solver.solve(this._board);
    }

    solveAutomatic(): boolean {
        let solver = new Solver();
        let moves: Move[];
        let freeCount = this._board.emptyFields();
        let prevFreeCount = freeCount + 1;

        while (freeCount < prevFreeCount) {
            if (freeCount === 0) {
                return true;
            }
            prevFreeCount = freeCount;
            solver.solve(this._board);
            let moves = solver.findAllResolvingMoves(this._board);
            if (moves.length > 0) {
                this._board.add(moves[0], Cause.TRIAL_CIPHER);
            }
            freeCount = this._board.emptyFields();
        }
        return false;
    }

    markBestTrialMove(): boolean {
        if (this._board.emptyFields() > 60) {
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

    public getBoxDigit(boxId: number, idInBox: number): number {
        return this._board.getDigit(Position.box(boxId)[idInBox]);
    }

    public setDigit(pos: Position, digit: number, cause: Cause) {
        let move = new Move(pos, digit);
        this._board.add(move, cause);
    }

    public hasError(pos: Position): boolean {
        return this._board.hasError(pos);
    }

    public isMarked(pos: Position): boolean {
        if (this._isHintVisible) {
            return this._board.isMarked(pos);
        }
        return false;
    }

    public isAllowed(pos: Position, digit: number): boolean {
        return this._board.fieldContent(pos).allows(digit);
    }

    public allowedChars(): string {
        return Move.AllowedChars;
    }

    public spaceCharacter(): string {
        return Move.SpaceChar;
    }
}