import { createFeatureSelector, createSelector } from "@ngrx/store";
// import { SudokuState } from "./sudoku.reducer";
import { Board } from "../model/sudoku/board";


// export const sudokuStateName = 'sudoku';

// export const getSudokuState =
//   createFeatureSelector<SudokuState>(sudokuStateName);

// export const getBoard = createSelector(
//   getSudokuState,
//   (state: SudokuState): Board => {
//     return state.board;
//   }
// );

export const initBoard = createFeatureSelector<Board>('board');
