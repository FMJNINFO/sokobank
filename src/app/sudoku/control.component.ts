import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Store, select } from "@ngrx/store";
import { StatusService } from "../services/status.service";

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
        if (this.cheatOptionVisible) {
            this.service.findAllCheats();
        }
    }

    onCopyOptionVisibilityChanged($event: any) {
        this.copyOptionVisible = $event.currentTarget.checked;
    }

    onHintVisibilityChanged($event: any) {
        this.cheatOptionVisible = $event.currentTarget.checked;
        this.service.showHint(this.cheatOptionVisible);
        if (this.cheatOptionVisible) {
            this.service.findAllCheats();
        }
    }

    onDigitHighlightingChanged($event: any) {
        this.digitHighlighting = $event.currentTarget.checked;
        this.service.unemphasizeDigits()
    }
}