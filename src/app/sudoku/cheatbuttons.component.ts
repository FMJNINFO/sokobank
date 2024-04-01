import { Component, Input } from "@angular/core";
import { StatusService } from "../services/status.service";

export @Component({
    selector: 'cheatbuttons',
    templateUrl: './cheatbuttons.component.html',
    styleUrls: ['./cheatbuttons.component.scss']
})

class CheatButtonsComponent {
    @Input()  type = "";

    constructor(private service: StatusService) {         
    }

    hasCheat(type: string): boolean {
        if (type == "Lonely Cipher") {
            return this.service.hasLonelyCipher();
        }
        if (type == "Unique Cipher") {
            return this.service.hasUniqueCipher();
        }
        if (type == "Closed Group") {
            return this.service.hasClosedGroup();
        }
        return false;
    }

    doFindCheat($event: MouseEvent, type: string) {
        if (type == "Lonely Cipher") {
            this.service.markNextLonelyCipher();
        }
        if (type == "Uniqe Cipher") {
            this.service.markNextUniqueCipher();
        }
        if (type == "Closed Group") {
            this.service.markNextClosedGroup();
        }
    }
}