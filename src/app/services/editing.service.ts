import { EventEmitter } from "@angular/core";
import { Position } from "../model/sudoku/position";

export class EditingService {
    public shouldEdit$: EventEmitter<Position>;
    private editor: Position;

    constructor() {
        this.shouldEdit$ = new EventEmitter();
        this.editor = Position.NoPosition;
    }

    public currentEditor(): Position {
        return this.editor;
    }

    public shouldEdit(pos: Position): void {
        this.editor = pos;
        this.shouldEdit$.emit(pos);
    }

    public onEditorChange(pos: Position): void {
        this.editor = pos;
        this.shouldEdit$.emit(pos);
    }
}