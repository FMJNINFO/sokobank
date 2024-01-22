import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SudokuService } from './sudoku.services';
import * as sudokuActions from './sudoku.actions';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Board } from '../model/sudoku/board';

// @Injectable()
// export class SudokuEffects {
//     constructor(
//         private actions$: Actions,
//         private sudokuService: SudokuService
//     ) {}

//     loadBoard$ = createEffect(() =>
//         this.actions$.pipe(
//             ofType(sudokuActions.loadBoard),
//             switchMap((action) =>
//                 this.sudokuService.getInitBoard().pipe(
//                     map(() => { return sudokuActions.loadBoardFinished({ payload: undefined}) }),
//                     catchError((error: any) => of(error))
//                 )
//             )        
//         )
//     )
// }