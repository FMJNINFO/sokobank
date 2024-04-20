import { Component } from "@angular/core";
import { StatusService } from "../services/status.service";

export @Component({
    selector: 'digitselect',
    templateUrl: './digitselect.component.html',
    styleUrls: ['./digitselect.component.scss']
})

class DigitSelectComponent {
    isOpen = false;

    constructor(private service: StatusService) {         
    }

    selectDigit($event: MouseEvent, digit: number) {
        console.log("Digit " + digit + " selected.");
        this.isOpen = false;
    }
}