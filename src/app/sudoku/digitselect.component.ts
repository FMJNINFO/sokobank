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
    @Input()  visible = false;
    editPos = Position.NoPosition;

    constructor(private service: StatusService) {     
        service.shouldEdit$.subscribe(pos => this.#setCurrentEditPosition(pos));
    }

    get trigger(): CdkOverlayOrigin {
        if (this.triggerCandidate == undefined) {
            throw new Error("Got an empty trigger component.");
        }
        return this.triggerCandidate;
    }

    selectDigit($event: MouseEvent, digit: number) {
        console.log("Digit " + digit + " selected.");
        if (digit >= 0) {
            this.service.setDigit(this.editPos, digit, Cause.ENTERED);
        }
        this.service.shouldEdit$.emit(Position.NoPosition);
    }

    #setCurrentEditPosition(pos: Position) {
        this.editPos = pos;
        console.log("Current edit position: " + pos.toString());
    }
}