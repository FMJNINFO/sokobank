import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { CoordValue, Evaluator } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { IFinder } from "./finder";
import { logAllowOccurrenceHeader, logAllowOccurrenceContent, logOccurrenceCount, logCoordValue } from "./logger";



export class OneAllowanceInGroup implements IFinder {
    evaluator = new Evaluator();

    constructor() {

    }

    find(board: Board): Array<CoordValue> {
        var foundValues: Array<CoordValue> = [];
        var group: number[] | undefined;
        var occCount: Map<number, number>;
        var groups = this.evaluator.groups;
        var openGroupFields: Array<FieldContent>;
        var groupFields: Array<FieldContent>;
        var newCV: CoordValue;
        
        for (var groupName of groups.keys()) {                
            group = groups.get(groupName);
            if (group != undefined) {
                groupFields = board.fields(group);
                openGroupFields = board.fields(group).filter(field => field.hasAllowSet());
                occCount = this.countGroupAllowDigits(openGroupFields);
                occCount.forEach((count, digit) => 
                    {
                        if (count == 1) {
                            let digitField = openGroupFields.find((field) => field.allowSet.contains(digit));
                            if (digitField != undefined) {
                                newCV = { coord: Evaluator.coord(digitField.pos), value: digit};
                                if (!foundValues.some((cv) => this.evaluator.eqCoordValue(cv, newCV))) {
                                    foundValues.push(newCV);
                                }
                            }
                        }
                    }
                );
            }
        }
        return foundValues;
    }

    findNext(board: Board): CoordValue | undefined {
        var coordValue: CoordValue | undefined;
        var code = 0;

        if (code == 0) {
            var groups = this.evaluator.groups;
            var group: number[] | undefined;
            var groupName: string;

            for (groupName of groups.keys()) {
                group = groups.get(groupName);
                // logAllowOccurrenceHeader("Row", iGrp);
                if (group != undefined) {
                    coordValue = this.groupAllowOccurrence(board, group);
                    if (coordValue != undefined) {
                        // logAllowSet("Two: ", field, true);
                        logCoordValue("Two: ", coordValue);
                        break;
                    }
                }
            }
        } else if (code == 1) {
            for (var iGrp of Evaluator.range) {
                logAllowOccurrenceHeader("Row", iGrp);
                coordValue = this.groupAllowOccurrence(board, this.evaluator.row[iGrp]);
                if (coordValue != undefined) {
                    break;
                }
            }
            if (coordValue == undefined) {
                for (var iGrp of Evaluator.range) {
                    logAllowOccurrenceHeader("Col", iGrp);
                    coordValue = this.groupAllowOccurrence(board, this.evaluator.col[iGrp]);
                    if (coordValue != undefined) {
                        break;
                    }
                }
            }
            if (coordValue == undefined) {
                for (var iGrp of Evaluator.range) {
                    logAllowOccurrenceHeader("Box", iGrp);
                    coordValue = this.groupAllowOccurrence(board, this.evaluator.box[iGrp]);
                    if (coordValue != undefined) {
                        break;
                    }
                }
            }
        } else if (code == 2) {

        }
        if (coordValue != undefined) {
            logCoordValue("Two: ", coordValue, true);
        }
        return coordValue;
    }

    countGroupAllowDigits(openGroupFields: Array<FieldContent>): Map<number, number> {
        var occCount= new Map<number, number>;
        for (let i=1; i<=9; i++)    { occCount.set(i, 0); }

        occCount = openGroupFields
                    .map(field => field.allowSet)
                    .reduce((counts, allowSet) => this.countDigits(counts, allowSet), occCount);
        return occCount;
    }

    countDigits(occCount: Map<number, number>, allowSet: CipherSet): Map<number, number> {
        var count: number| undefined;
        for (let digit of allowSet.entries) {
            count = occCount.get(digit);
            if (count != undefined) {
                occCount.set(digit, count+1);
            }
        }
        return occCount;
    }

    groupAllowOccurrence(board: Board, group: Array<number>): CoordValue | undefined {
        var occCount = new Map<number, number|undefined>();
        var digit: number;
        var count: number | undefined;
        var field: FieldContent;

        for (var iOfs of Evaluator.range) {
            field = board.field(group[iOfs]);
            if (field.hasAllowSet()) {
                logAllowOccurrenceContent(field.pos, field.allowSet);
                for (var digit of field.allowSet.entries) {
                    count = occCount.get(digit);
                    count = count == undefined ? 1 : count+1;
                    occCount.set(digit, count);
                }
            }
        }

        logOccurrenceCount(occCount);

        for (digit of occCount.keys()) {
            if (occCount.get(digit) == 1) {
                for (var iOfs of Evaluator.range) {
                    field = board.field(group[iOfs]);
                    if (field.hasAllowSet() && field.allows(digit)) {
                        return { coord: Evaluator.coord(field.pos), value: digit };
                    }
                }
            }
        }
        return undefined;
    }
}