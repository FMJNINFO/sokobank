import { Component, Input } from "@angular/core";
import { FieldContent } from "../model/sudoku/fieldContent";

export @Component({
    selector: 'cipher',
    templateUrl: './cipher.component.html',
    styleUrls: ['./cipher.component.scss']

})
class CipherComponent {
    @Input('ngModel') content = FieldContent.NoFieldContent;
    _digit = 2;
}

