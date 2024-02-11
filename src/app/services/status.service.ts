import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";
import { Board } from "../model/sudoku/board";
import { logBoard } from "../model/sudoku/logger";

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
        this._isHintVisible = true;
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
}