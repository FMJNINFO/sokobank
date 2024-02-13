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

    constructor(private service: StatusService) {
        // service.showHint$.subscribe(visible => this.onHintVisibilityChanged(visible));        
    }

    // private onHintVisibilityChanged(visible: boolean) {
    //     console.log("Hint is " + (visible ? "" : "not") + " visible.");
    // }

    onHintVisibilityChanged($event: any) {
        this.service.showHint($event.currentTarget.checked);
    }
}