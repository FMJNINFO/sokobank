import { Component, OnInit } from '@angular/core';
import { message } from '../model/sudoku/logger';
import { testBoardMaster0, testBoardMaster1, testBoardMaster2, testBoardMaster3 } from '../model/sudoku/testboards';
import { StatusService } from '../services/status.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(private service: StatusService) {
        this.service.changeBoard(testBoardMaster3());
    }

    ngOnInit() {}

    setTestBoard0($event: Event) {
        this.service.changeBoard(testBoardMaster0());
    }

    setTestBoard1($event: Event) {
        this.service.changeBoard(testBoardMaster1());
    }

    setTestBoard2($event: Event) {
        this.service.changeBoard(testBoardMaster2());
    }

    setTestBoard3($event: Event) {
        this.service.changeBoard(testBoardMaster3());
    }

    doFindLonelyCipher($event: Event) {
        this.service.markAllLonelyCiphers();
    }

    doFindUniqueCiphers($event: Event) {
        this.service.markUniqueCiphers();
    }

    doFindClosedGroup($event: Event) {
        this.service.markClosedGroup();
    }

    doFillAutomatic($event: Event) {
        this.service.fillAutomatic();
    }

    doResolveByTrial($event: Event) {
        if (!this.service.markResolutionByTrial()) {
            message("Insufficient filled fields (<20) or no resolution found.");
        }
    }    
}

