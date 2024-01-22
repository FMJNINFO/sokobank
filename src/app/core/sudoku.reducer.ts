import { Action, createReducer, on } from '@ngrx/store';
import { Board } from "../model/sudoku/board";
import { testBoardMaster3 } from "../model/sudoku/testboards";
import * as sudokuActions from './sudoku.actions';
import { BoardApiActions } from './sudoku.actions';

export const initialState: Board = new Board();

export const baordReducer = createReducer(
  initialState,
  on(BoardApiActions.initBoardSettings, (_state, { board }) => board)
);

// export interface SudokuState {
//     board: Board;
// }

// export const initialState: SudokuState = {
//     board: testBoardMaster3()
// };

// const sudokuReducerInternal = createReducer(
//     initialState,
//     on(
//         sudokuActions.loadBoard,
//         (state: any, { payload }: any) => ({
//           ...state,
//           anschluss: payload,
//         })
//     )
// )

// export function sudokuReducer(
//     state: SudokuState,
//     action: Action
// ) {
//     return sudokuReducerInternal(state, action);
// }
