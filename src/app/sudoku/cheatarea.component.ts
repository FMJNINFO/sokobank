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

    hasCheat(): boolean {
        return this.service.hasCheat();
    }

    get isHintVisible(): boolean {
        return this.service.isHintVisible();
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
}