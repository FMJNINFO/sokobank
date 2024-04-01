import { Move } from "./move";
import { Step } from "./step";

export class TestBoardMoves {

    constructor() {
    }

    getSteps(id: string): Step[] {
        let stepString = "";
        switch(id) {
            case "testboard5":
                stepString = "8...7.9.....4...53.42..5........8.9.9..3......73...26.58.....32.....15...2.8.....";
                break;
            case "testboard4":
                stepString = ".25..6.......2.1.68..4...9......7.6.68....5.1.5..8.........8..9.41....539...1....";
                break;
            case "testboard3":
                stepString = "..6....5...1..68.747........5924.......9..3.....1..52.8.........2..71...6.4.9...3";
                break;
            case "testboard2":
                stepString = ".4..19.768.......3...6......9..27.1...4...9.......5.....3.62..7.2.5........4...6.";
                break;
            case "testboard1":
                stepString = "38.1..67......42....6......75.3...8.9............1...356..2.7....95.......1....6.";
                break;
            case "testboard0":
                stepString = ".1..............14..8...65..5....2..1.3.42..6.8..93....9..8.7.523.7..........6.9.";
                break;
        }
        return Step.stringToSteps(stepString);
    }
}
