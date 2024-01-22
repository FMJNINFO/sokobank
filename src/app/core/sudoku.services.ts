import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Board } from "../model/sudoku/board";
import { testBoardMaster3 } from "../model/sudoku/testboards";

@Injectable({
  providedIn: 'root'
})
export class SudokuService {
  constructor() {}

  getInitBoard(): Observable<Board> {
    return of(testBoardMaster3())
  }
}
