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
    constructor(private service: StatusService) {
    }

    ngOnInit() {}
}

