import { Board } from "./board";
import { Position } from "./position";

function setByRowCol(board: Board, row: number, col: number, digit: number): void {
    var pos = Position.of(row*9 + col);
    board.set(pos, digit);
}

export function testBoardMaster0(): Board {
    let tb = new Board();
    setByRowCol(tb, 0, 1, 1);
    setByRowCol(tb, 1, 7, 1);
    setByRowCol(tb, 1, 8, 4);
    setByRowCol(tb, 2, 2, 8);
    setByRowCol(tb, 2, 6, 6);
    setByRowCol(tb, 2, 7, 5);
    setByRowCol(tb, 3, 1, 5);
    setByRowCol(tb, 3, 6, 2);
    setByRowCol(tb, 4, 0, 1);
    setByRowCol(tb, 4, 2, 3);
    setByRowCol(tb, 4, 4, 4);
    setByRowCol(tb, 4, 5, 2);
    setByRowCol(tb, 4, 8, 6);
    setByRowCol(tb, 5, 1, 8);
    setByRowCol(tb, 5, 4, 9);
    setByRowCol(tb, 5, 5, 3);
    setByRowCol(tb, 6, 1, 9);
    setByRowCol(tb, 6, 4, 8);
    setByRowCol(tb, 6, 6, 7);
    setByRowCol(tb, 6, 8, 5);
    setByRowCol(tb, 7, 0, 2);
    setByRowCol(tb, 7, 1, 3);
    setByRowCol(tb, 7, 3, 7);
    setByRowCol(tb, 8, 5, 6);
    setByRowCol(tb, 8, 7, 9);
    tb.stopInitialize();

    return tb;
}

export function testBoardMaster1(): Board {
    let tb = new Board();
    setByRowCol(tb, 0, 0, 3);
    setByRowCol(tb, 0, 1, 8);
    setByRowCol(tb, 0, 3, 1);
    setByRowCol(tb, 0, 6, 6);
    setByRowCol(tb, 0, 7, 7);
    setByRowCol(tb, 1, 5, 4);
    setByRowCol(tb, 1, 6, 2);
    setByRowCol(tb, 2, 2, 6);
    setByRowCol(tb, 3, 0, 7);
    setByRowCol(tb, 3, 1, 5);
    setByRowCol(tb, 3, 3, 3);
    setByRowCol(tb, 3, 7, 8);
    setByRowCol(tb, 4, 0, 9);
    setByRowCol(tb, 5, 4, 1);
    setByRowCol(tb, 5, 8, 3);
    setByRowCol(tb, 6, 0, 5);
    setByRowCol(tb, 6, 1, 6);
    setByRowCol(tb, 6, 4, 2);
    setByRowCol(tb, 6, 6, 7);
    setByRowCol(tb, 7, 2, 9);
    setByRowCol(tb, 7, 3, 5);
    setByRowCol(tb, 8, 2, 1);
    setByRowCol(tb, 8, 7, 6);
    tb.stopInitialize();

    return tb;
}

export function testBoardMaster2(): Board {
    let tb = new Board();
    setByRowCol(tb, 0, 1, 4);
    setByRowCol(tb, 0, 4, 1);
    setByRowCol(tb, 0, 5, 9);
    setByRowCol(tb, 0, 7, 7);
    setByRowCol(tb, 0, 8, 6);
    setByRowCol(tb, 1, 0, 8);
    setByRowCol(tb, 1, 8, 3);
    setByRowCol(tb, 2, 3, 6);
    setByRowCol(tb, 3, 1, 9);
    setByRowCol(tb, 3, 4, 2);
    setByRowCol(tb, 3, 5, 7);
    setByRowCol(tb, 3, 7, 1);
    setByRowCol(tb, 4, 2, 4);
    setByRowCol(tb, 4, 6, 9);
    setByRowCol(tb, 5, 5, 5);
    setByRowCol(tb, 6, 2, 3);
    setByRowCol(tb, 6, 4, 6);
    setByRowCol(tb, 6, 5, 2);
    setByRowCol(tb, 6, 8, 7);
    setByRowCol(tb, 7, 1, 2);
    setByRowCol(tb, 7, 3, 5);
    setByRowCol(tb, 8, 3, 4);
    setByRowCol(tb, 8, 7, 6);
    tb.stopInitialize();

    return tb;
}

export function testBoardMaster3(): Board {
    let tb = new Board();
    setByRowCol(tb, 0, 2, 6);
    setByRowCol(tb, 0, 7, 5);
    setByRowCol(tb, 1, 2, 1);
    setByRowCol(tb, 1, 5, 6);
    setByRowCol(tb, 1, 6, 8);
    setByRowCol(tb, 1, 8, 7);
    setByRowCol(tb, 2, 0, 4);
    setByRowCol(tb, 2, 1, 7);
    setByRowCol(tb, 3, 1, 5);
    setByRowCol(tb, 3, 2, 9);
    setByRowCol(tb, 3, 3, 2);
    setByRowCol(tb, 3, 4, 4);
    setByRowCol(tb, 4, 3, 9);
    setByRowCol(tb, 4, 6, 3);
    setByRowCol(tb, 5, 3, 1);
    setByRowCol(tb, 5, 6, 5);
    setByRowCol(tb, 5, 7, 2);
    setByRowCol(tb, 6, 0, 8);
    setByRowCol(tb, 7, 1, 2);
    setByRowCol(tb, 7, 4, 7);
    setByRowCol(tb, 7, 5, 1);
    setByRowCol(tb, 8, 0, 6);
    setByRowCol(tb, 8, 2, 4);
    setByRowCol(tb, 8, 4, 9);
    setByRowCol(tb, 8, 8, 3);
    tb.stopInitialize();

    return tb;
}
