import { Board } from "../model/sudoku/board";
import { testBoardMaster3 } from "../model/sudoku/testboards";


export interface SudokuState {
    board: Board;
}

export const initialState: SudokuState = {
    board: testBoardMaster3()
};
