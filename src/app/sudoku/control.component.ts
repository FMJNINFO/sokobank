import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { StatusService } from "../services/status.service";
import { Cause } from "../model/sudoku/fieldContent";
import { Move } from "../model/sudoku/move";

export @Component({
    selector: 'control',
    templateUrl: './control.component.html',
    styleUrls: ['./control.component.scss']

})
class ControlComponent {
    constructor(private service: StatusService) {
        // service.showHint$.subscribe(visible => this.onHintVisibilityChanged(visible)); 
    }

    onHintVisibilityChanged($event: any) {
        this.service.showHint($event.currentTarget.checked);
    }

    onDigitVisibilityChanged($event: any) {
        this.service.showDigits($event.currentTarget.checked);
    }

    markDigit(digit: number) {
        this.service.emphasizeDigit(digit);
    }

    isDigitMarked(digit: number): boolean {
        return this.service.isDigitEmphasized(digit);
    }

    #assembleBoardText(sOld: string, selStart: number, selEnd: number):  [string, number] {
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
                let [newText, selStart] = this.#assembleBoardText(textarea.value, sel0, sel1)
                textarea.value = newText;
                textarea.selectionStart = selStart;
                textarea.selectionEnd = selStart;
            }
        }
    }

    doCopyFromBoard(boardcopy: HTMLTextAreaElement) {
        console.log("From Board");
        let s = this.service.getBoardContentAsString();
        let [newText, selStart] = this.#assembleBoardText(s, 0, 0);
        boardcopy.value = newText;
    }

    doCopyToBoard(boardcopy: HTMLTextAreaElement) {
        console.log("To Board");
        let s = boardcopy.value;
        let moves = Move.stringToMoves(s);
        this.service.setBoardByMoves(moves, Cause.PRESET);
    }
}