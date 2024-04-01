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
}