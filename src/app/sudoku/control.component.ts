import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { StatusService } from "../services/status.service";
import { Step } from "../model/sudoku/step";

export @Component({
    selector: 'control',
    templateUrl: './control.component.html',
    styleUrls: ['./control.component.scss']

})
class ControlComponent {
    copyOptionVisible = false;
    cheatOptionVisible = false;
    digitHighlighting = false;

    constructor(private service: StatusService) {
    }

    onCopyOptionVisibilityChanged($event: any) {
        this.copyOptionVisible = $event.currentTarget.checked;
    }

    onHintVisibilityChanged($event: any) {
        this.service.showHint($event.currentTarget.checked);
        if (this.isHintVisible) {
            this.service.findAllCheats();
        }
    }

    get isHintVisible(): boolean {
        return this.service.isHintVisible();
    }

    onDigitVisibilityChanged($event: any) {
        this.service.showDigits($event.currentTarget.checked);
    }

    onDigitHighlightingChanged($event: any) {
        this.digitHighlighting = $event.currentTarget.checked;
        this.service.unemphasizeDigits()
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
        let steps = Step.stringToSteps(s);
        this.service.setBoardBySteps(steps);
    }
}