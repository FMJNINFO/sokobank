import { Board } from "./board";

export function testBoardMaster0(): Board {
    let tb = new Board();
    tb.set(0, 1, 1);
    tb.set(1, 7, 1);
    tb.set(1, 8, 4);
    tb.set(2, 2, 8);
    tb.set(2, 6, 6);
    tb.set(2, 7, 5);
    tb.set(3, 1, 5);
    tb.set(3, 6, 2);
    tb.set(4, 0, 1);
    tb.set(4, 2, 3);
    tb.set(4, 4, 4);
    tb.set(4, 5, 2);
    tb.set(4, 8, 6);
    tb.set(5, 1, 8);
    tb.set(5, 4, 9);
    tb.set(5, 5, 3);
    tb.set(6, 1, 9);
    tb.set(6, 4, 8);
    tb.set(6, 6, 7);
    tb.set(6, 8, 5);
    tb.set(7, 0, 2);
    tb.set(7, 1, 3);
    tb.set(7, 3, 7);
    tb.set(8, 5, 6);
    tb.set(8, 7, 9);
    tb.stopInitialize();

    return tb;
}

export function testBoardMaster1(): Board {
    let tb = new Board();
    tb.set(0, 0, 3);
    tb.set(0, 1, 8);
    tb.set(0, 3, 1);
    tb.set(0, 6, 6);
    tb.set(0, 7, 7);
    tb.set(1, 5, 4);
    tb.set(1, 6, 2);
    tb.set(2, 2, 6);
    tb.set(3, 0, 7);
    tb.set(3, 1, 5);
    tb.set(3, 3, 3);
    tb.set(3, 7, 8);
    tb.set(4, 0, 9);
    tb.set(5, 4, 1);
    tb.set(5, 8, 3);
    tb.set(6, 0, 5);
    tb.set(6, 1, 6);
    tb.set(6, 4, 2);
    tb.set(6, 6, 7);
    tb.set(7, 2, 9);
    tb.set(7, 3, 5);
    tb.set(8, 2, 1);
    tb.set(8, 7, 6);
    tb.stopInitialize();

    return tb;
}

export function testBoardMaster2(): Board {
    let tb = new Board();
    tb.set(0, 1, 4);
    tb.set(0, 4, 1);
    tb.set(0, 5, 9);
    tb.set(0, 7, 7);
    tb.set(0, 8, 6);
    tb.set(1, 0, 8);
    tb.set(1, 8, 3);
    tb.set(2, 3, 6);
    tb.set(3, 1, 9);
    tb.set(3, 4, 2);
    tb.set(3, 5, 7);
    tb.set(3, 7, 1);
    tb.set(4, 2, 4);
    tb.set(4, 6, 9);
    tb.set(5, 5, 5);
    tb.set(6, 2, 3);
    tb.set(6, 4, 6);
    tb.set(6, 5, 2);
    tb.set(6, 8, 7);
    tb.set(7, 1, 2);
    tb.set(7, 3, 5);
    tb.set(8, 3, 4);
    tb.set(8, 7, 6);
    tb.stopInitialize();

    return tb;
}

export function testBoardMaster3(): Board {
    let tb = new Board();
    tb.set(0, 2, 6);
    tb.set(0, 7, 5);
    tb.set(1, 2, 1);
    tb.set(1, 5, 6);
    tb.set(1, 6, 8);
    tb.set(1, 8, 7);
    tb.set(2, 0, 4);
    tb.set(2, 1, 7);
    tb.set(3, 1, 5);
    tb.set(3, 2, 9);
    tb.set(3, 3, 2);
    tb.set(3, 4, 4);
    tb.set(4, 3, 9);
    tb.set(4, 6, 3);
    tb.set(5, 3, 1);
    tb.set(5, 6, 5);
    tb.set(5, 7, 2);
    tb.set(6, 0, 8);
    tb.set(7, 1, 2);
    tb.set(7, 4, 7);
    tb.set(7, 5, 1);
    tb.set(8, 0, 6);
    tb.set(8, 2, 4);
    tb.set(8, 4, 9);
    tb.set(8, 8, 3);
    tb.stopInitialize();

    return tb;
}
