import { Board } from "./board";
import { Evaluator, CoordValue, Coord } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { Finder, IFinder } from "./finder";
import { logBoard, logTrialField } from "./logger";

export class SimpleTryoutFinder implements IFinder {
    evaluator = new Evaluator();
    breakIt = false;

    constructor() {

    }

    findNext(board: Board): CoordValue | undefined {
        //  Simple try and error
        var copyBoard = board.copy();
        var field: FieldContent;
        var coord: Coord;
        var finder = new Finder();

        for (var len=2; len<10; len++) {
            for (let iPos = 0; iPos < 81; iPos++) {
                field = copyBoard.field(iPos);
                if (field.hasAllowSet() && field.allowSetLength == len) {
                    for (let digit of Evaluator.range) {
                        if (field.allowSet.contains(digit)) {
                            coord = Evaluator.coord(iPos);
                            logTrialField(field, digit);
                            copyBoard.set(coord.row, coord.col, digit);                            
                            logBoard(copyBoard);
                            if (this.breakIt) {
                                return undefined;
                            }
                            if (finder.findAll(copyBoard)) {
                                return { coord: coord, value: digit};
                            }
                        }
                    }
                }
            }
        }
        return undefined;
    }
}
