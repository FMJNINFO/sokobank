import { createAction, createActionGroup, props } from '@ngrx/store';
import { Board } from '../model/sudoku/board';

export const BoardApiActions = createActionGroup({
  source: 'Sudoku API',
  events: {
    'Init Board Settings': props<{ board: Board }>(),
  },
});
