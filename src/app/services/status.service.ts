import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";
import { Board } from "../model/sudoku/board";
import { logBoard } from "../model/sudoku/logger";
import { Move } from "../model/sudoku/move";
import { Solver } from "../model/sudoku/solver";

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

    public setBoardByMoves(moves: Move[]) {
        this._board.startInitialize();
        for (let move of moves) {
            this._board.add(move);
        }
        this._board.stopInitialize();
    }

    public markAllLonelyCiphers(): void {
        var doLogging = true;
        var solver = new Solver();

        var moves = solver.findAllLonelyCiphers(this._board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Lonely cipher: " + move.toString())
            }
            console.log("-- Find Lonely Cipher done.")
        }
        this._board.mark(new Set(moves.map((m) => m.pos)));
    }

    markUniqueCiphers() {
        var doLogging = true;
        var solver = new Solver();

        var moves = solver.findAllUniqueCiphers(this._board);
        if (doLogging) {
            for (let move of moves) {
                console.log("Found unique cipher: " + move.toString());
            }
            console.log("-- Find Unique Cipher done.")
        }
        this._board.mark(new Set(moves.map((m) => m.pos)));
    }

    markClosedGroup() {
        var doLogging = true;
        var solver = new Solver();
        var closedGroups = solver.findAllClosedGroups(this._board);

        if (closedGroups.length > 0) {
            let smallestGroup = closedGroups.sortedBySize()[0];
            this._board.mark(smallestGroup.asSet())
        }
        if (doLogging) {
            for (let cg of closedGroups.sortedByName()) {
                console.log(cg.toString())
            }
            console.log("-- Find Closed Group done.")
        }
    }

    fillAutomatic() {
        var solver = new Solver();
        solver.solve(this._board);
    }

    markResolutionByTrial(): boolean {
        if (this._board.emptyFields() > 60) {
            return false;
        }
        var doLogging = true;
        var solver = new Solver();
        var moves = solver.findAllResolvingMoves(this._board);
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

    public getBoxDigit(boxId: number, idInBox: number): number {
        return this._board.getDigit(Position.box(boxId)[idInBox]);
    }

    public setDigit(pos: Position, digit: number) {
        let move = new Move(pos, digit);
        this._board.add(move);
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
        return Board.AllowedChars;
    }

    public spaceCharacter(): string {
        return Board.SpaceChar;
    }
}