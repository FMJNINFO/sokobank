import { MoveFinder } from "./moveFinder";

export class TestBoardMoves {
    moveFinder: MoveFinder;

    constructor() {
        this.moveFinder = new MoveFinder();
    }

    getMoves(id: string) {
        let moveString = "";
        switch(id) {
            case "testboard3":
                moveString = "..6....5...1..68.747........5924.......9..3.....1..52.8.........2..71...6.4.9...3";
                break;
            case "testboard2":
                moveString = ".4..19.768.......3...6......9..27.1...4...9.......5.....3.62..7.2.5........4...6.";
                break;
            case "testboard1":
                moveString = "38.1..67......42....6......75.3...8.9............1...356..2.7....95.......1....6.";
                break;
            case "testboard0":
                moveString = ".1..............14..8...65..5....2..1.3.42..6.8..93....9..8.7.523.7..........6.9.";
                break;
        }
        return this.moveFinder.stringToMoves(moveString);
    }
}
