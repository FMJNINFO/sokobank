import { Component, Input } from "@angular/core";
import { StatusService } from "../services/status.service";

export @Component({
    selector: 'digitHighlighting',
    templateUrl: './digitHighlighting.component.html',
    styleUrls: ['./digitHighlighting.component.scss']
})

class DigitHighlightingComponent {
    @Input()  isVisible = false;

    constructor(private service: StatusService) {
    }

    markDigit(digit: number) {
        this.service.emphasizeDigit(digit);
    }

    isDigitMarked(digit: number): boolean {
        return this.service.isDigitEmphasized(digit);
    }
}