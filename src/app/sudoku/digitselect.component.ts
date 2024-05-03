import { Component, EventEmitter, Input, Output } from "@angular/core";
import { StatusService } from "../services/status.service";
import { CdkOverlayOrigin } from "@angular/cdk/overlay";
import { Position } from "../model/sudoku/position";
import { Cause } from "../model/sudoku/cause";

export @Component({
    selector: 'digitselect',
    templateUrl: './digitselect.component.html',
    styleUrls: ['./digitselect.component.scss']
})

class DigitSelectComponent {
    @Input()  triggerCandidate: CdkOverlayOrigin | undefined;
    @Input()  maybeVisible = false;

    constructor(private service: StatusService) {
    }

    get visible(): boolean {
        return this.maybeVisible;
    }

    get trigger(): CdkOverlayOrigin {
        if (this.triggerCandidate == undefined) {
            throw new Error("Got an empty trigger component.");
        }
        return this.triggerCandidate;
    }

    selectDigit($event: MouseEvent, digit: number) {
        if (this.service.isDigitEditing()) {
            console.log("Digit " + digit + " selected.");
            if (digit >= 0) {
                this.service.setDigit(this.service.digitEditorPos, digit, Cause.ENTERED);
            }
            this.service.stopDigitEditing();
        }
    }
}