import { Component } from "@angular/core";
import { StatusService } from "../services/status.service";

export @Component({
    selector: 'cheatarea',
    templateUrl: './cheatarea.component.html',
    styleUrls: ['./cheatarea.component.scss']
})

class CheatAreaComponent {

    constructor(private service: StatusService) {         
    }

    doApplyCheat($event: MouseEvent) {
        this.service.applyCheat();
    }

    hasCheat(): boolean {
        return this.service.hasCheat();
    }

    onHintVisibilityChanged($event: any) {
        this.service.showHint($event.currentTarget.checked);
    }

    get isHintVisible(): boolean {
        return this.service.isHintVisible();
    }

    onDigitVisibilityChanged($event: any) {
        this.service.showDigits($event.currentTarget.checked);
    }

    get areDigitsVisible(): boolean {
        return this.service.areDigitsVisible();
    }
}