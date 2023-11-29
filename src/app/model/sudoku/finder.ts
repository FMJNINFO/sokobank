import { Board } from "./board";
import { Evaluator, CoordValue } from "./evaluator";
import { SimpleTryoutFinder } from "./simpleTryoutFinder";
import { SingleDigitAllowed } from "./singleDigitAllowed";
import { AllowanceRemovingClosedGroup } from "./allowanceRemovingClosedGroup";
import { OneAllowanceInGroup } from "./oneAllowanceInGroup";
import { ClosedSubgroupJoiner } from "./closedSubgroupJoiner";

export interface IFinder {
    findNext: (board: Board) => CoordValue | undefined
}

export class Finder implements IFinder {
    evaluator = new Evaluator();
    finders: Array<IFinder>;
    joiner = new ClosedSubgroupJoiner()

    constructor() {
        this.finders = new Array<IFinder>();
        this.finders.push(new SingleDigitAllowed());
        this.finders.push(new OneAllowanceInGroup());
        this.finders.push(new AllowanceRemovingClosedGroup());
        // this.finders.push(new FinderLevelFour());
    }

    findNext(board: Board): CoordValue | undefined {
        var coordValue: CoordValue | undefined = undefined;
        var finder: IFinder;
        
        for (finder of this.finders) {
            coordValue = finder.findNext(board);
            if (coordValue != undefined) {
                return coordValue;
            }
        }
        return undefined;
    }

    findAll(board: Board): boolean {
        var finder: IFinder = new Finder();

        while (!board.isFull()) {
            var cleanBoard = this.joiner.cleanUntilOneFound(board);
            var cleaned = cleanBoard;
            while (cleanBoard) {
                cleanBoard = this.joiner.cleanUntilOneFound(board);
                cleaned = cleaned || cleanBoard;
            }
    
            var next = finder.findNext(board);
            if (next == undefined) {
                return false;
            }
            board.set(next.coord.row, next.coord.col, next.value);

            // board.evaluate();
            // var next = finder.findNext(board);
            // if (next == undefined) {
            //     return false;
            // }
            // board.set(next.coord.row, next.coord.col, next.value);
        }
        return true;
    }
}