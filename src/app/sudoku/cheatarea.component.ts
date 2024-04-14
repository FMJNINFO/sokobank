import { Component, Input } from "@angular/core";
import { StatusService } from "../services/status.service";

export @Component({
    selector: 'cheatarea',
    templateUrl: './cheatarea.component.html',
    styleUrls: ['./cheatarea.component.scss']
})

class CheatAreaComponent {
    @Input()  isVisible = false;

    constructor(private service: StatusService) {         
    }

    doApplyCheat($event: MouseEvent) {
        this.service.applyCheat();
    }

    doFillComplete($event: MouseEvent) {
        if (this.isFillCompleteAllowed()) {
            this.service.fillComplete();
        }
    }

    hasCheat(): boolean {
        return this.service.hasCheat();
    }

    onDigitVisibilityChanged($event: any) {
        this.service.showDigits($event.currentTarget.checked);
    }

    get digitVisibility(): boolean {
        return this.service.areDigitsVisible();
    }

    set digitVisibility(isVisible: boolean) {
        this.service.showHint(isVisible);
    }

    get areDigitsVisible(): boolean {
        return this.service.areDigitsVisible();
    }

    isFillCompleteAllowed():boolean {
        return this.service.isFillCompleteAllowed();
    }
}