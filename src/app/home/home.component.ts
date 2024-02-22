import { Component, OnInit } from '@angular/core';
import { message } from '../model/sudoku/logger';
import { TestBoardMoves } from '../model/sudoku/testboardMoves';
import { StatusService } from '../services/status.service';
import { Cause } from '../model/sudoku/fieldContent';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    testBoardMoves: TestBoardMoves;

    constructor(private service: StatusService) {
        this.testBoardMoves = new TestBoardMoves();
        this.setTestBoard("testboard3");
    }

    ngOnInit() {}

    setTestBoard(id: string) {
        this.service.setBoardByMoves(this.testBoardMoves.getMoves(id), Cause.PRESET);
    }
    
    doFindLonelyCiphers($event: Event) {
        this.service.markAllLonelyCiphers();
    }

    doFillLonelyCiphers($event: Event) {
        this.service.fillLonelyCiphers();
    }

    doFindUniqueCiphers($event: Event) {
        this.service.markUniqueCiphers();
    }

    doFillUniqueCiphers($event: Event) {
        this.service.fillUniqueCiphers();
    }

    doFindClosedGroup($event: Event) {
        this.service.markClosedGroup();
    }

    doCleanClosedGroup($event: Event) {
        this.service.cleanClosedGroup();
    }

    doFillAutomatic($event: Event) {
        this.service.fillAutomatic();
    }

    doResolveByTrial($event: Event) {
        if (this.service.getBoard().emptyFields() > 60) {
            message("Insufficient filled fields (<20) or no resolution found.");
        }
        this.service.markBestTrialMove();
    }    

    doFillBestTrialMove($event: Event) {
        if (this.service.getBoard().emptyFields() > 60) {
            message("Insufficient filled fields (<20) or no resolution found.");
        }
        this.service.fillBestTrialMove();
    }    

    doSolveAutomatic($event: Event) {
        this.service.solveAutomatic();
    }
}

