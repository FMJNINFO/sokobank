import { Board } from "./board";
import { Evaluator, CoordValue } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { IFinder } from "./finder";
import { logFieldAllowSet } from "./logger";

export class SingleDigitAllowed implements IFinder {
    evaluator = new Evaluator();

    constructor() {

    }

    findNext(board: Board): CoordValue | undefined {
        var field: FieldContent;
        for (var iPos=0; iPos<81; iPos++) {
            field = board.field(iPos);
            if (field.hasAllowSet()) {
                if (field.allowSet.length == 1) {
                    var digit = field.allowSet.entries[0];
                    logFieldAllowSet("One: ", field, true);
                    return { coord: Evaluator.coord(field.pos), value: digit };
                }
            }     
        }
        return undefined;
    }

    find(board: Board): Array<CoordValue> {
        var foundValues = [];
        var field: FieldContent;
        for (var iPos=0; iPos<81; iPos++) {
            field = board.field(iPos);
            if (field.hasAllowSet()) {
                if (field.allowSet.length == 1) {
                    var digit = field.allowSet.entries[0];
                    // logFieldAllowSet("One: ", field, true);
                    foundValues.push({ coord: Evaluator.coord(field.pos), value: digit });
                    // return { coord: Evaluator.coord(field.pos), value: digit };
                }
            }     
        }
        return foundValues;
    }
}
