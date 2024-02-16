import { Component, OnInit } from '@angular/core';
import { message } from '../model/sudoku/logger';
import { TestBoardMoves } from '../model/sudoku/testboardMoves';
import { StatusService } from '../services/status.service';

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
        this.service.setBoardByMoves(this.testBoardMoves.getMoves(id));
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

