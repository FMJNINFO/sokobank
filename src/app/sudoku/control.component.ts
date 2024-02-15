import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { StatusService } from "../services/status.service";
import { testBoardMaster0 } from "../model/sudoku/testboards";
import { Board } from "../model/sudoku/board";
import { Move } from "../model/sudoku/move";
import { Position } from "../model/sudoku/position";

export @Component({
    selector: 'control',
    templateUrl: './control.component.html',
    styleUrls: ['./control.component.scss']

})
class ControlComponent {

    constructor(private service: StatusService) {
        // service.showHint$.subscribe(visible => this.onHintVisibilityChanged(visible)); 
    }

    // private onHintVisibilityChanged(visible: boolean) {
    //     console.log("Hint is " + (visible ? "" : "not") + " visible.");
    // }

    onHintVisibilityChanged($event: any) {
        this.service.showHint($event.currentTarget.checked);
    }

    _assembleBoardText(sOld: string, selStart: number, selEnd: number):  [string, number] {
        const chAllowed = this.service.allowedChars() + this.service.spaceCharacter();
        let jStart = selStart;
        let sNew = "";
        if (sOld.length > 0) {
            let i = 0;
            while (i<sOld.length) {
                if (sNew.length>=108) {
                    break;
                }
                if (i==selStart) {
                    jStart = sNew.length;
                    i = selEnd;
                }
                let ch = sOld.at(i);
                if ((ch != undefined) && (chAllowed.includes(ch))) {
                    sNew += ch;
                }
                i += 1;
                if (35 == sNew.length % 36) {
                    sNew += '\n';
                }
                if (3 == sNew.length % 4) {
                    sNew += ' ';
                }
            }
            sNew = sNew.replaceAll('\n', '\n\n');
        }
        return [sNew, jStart] ;
    }

    onInput($event: Event) {
        if ($event instanceof InputEvent) {
            let $inpEvent = $event as InputEvent;
            if ($inpEvent.currentTarget instanceof HTMLTextAreaElement) {
                let textarea = $inpEvent.currentTarget as HTMLTextAreaElement;
                let sel0 = textarea.selectionStart;
                let sel1 = textarea.selectionEnd;
                let [newText, selStart] = this._assembleBoardText(textarea.value, sel0, sel1)
                textarea.value = newText;
                textarea.selectionStart = selStart;
                textarea.selectionEnd = selStart;
            }
        }
    }

    doCopyFromBoard(boardcopy: HTMLTextAreaElement) {
        console.log("From Board");
        let s = this.service.getBoardContentAsString();
        let [newText, selStart] = this._assembleBoardText(s, 0, 0);
        boardcopy.value = newText;
    }

    doCopyToBoard(boardcopy: HTMLTextAreaElement) {
        console.log("To Board");
        let s = boardcopy.value;
        let moves = this.stringToMoves(s)
        this.service.setBoardByMoves(moves);
    }

    stringToMoves(s: string, ): Move[] {        
        const pool = Position.pool();
        let moves = new Array<Move>();
        let ch: string | undefined;
        let digit: number | undefined;
        let ofs = 0;
        let iPos = 0;

        while (iPos < 81) {
            ch = s.at(ofs);
            ofs += 1;
            if ((ch === undefined) || (ch === Board.SpaceChar)) {
                digit = 0;
            } else {
                if (Board.AllowedChars.includes(ch)) {
                    digit = parseInt(ch);
                } else {
                    digit = undefined;
                }
            }
            if (digit !== undefined) {
                moves.push(new Move(pool[iPos], digit))
                iPos += 1;
            }
        }
        return moves;
    }


}