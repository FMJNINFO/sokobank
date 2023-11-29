import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { Coord, CoordValue, Evaluator } from "./evaluator";
import { FieldContent } from "./fieldContent";

var doLogBoard = true;
var doLogOccurrences = true;
var doLogBoardEvaluation = false;
var doLogAllowSet = true;
var doLogAllowSets = true;
var doLogEvaluationAreas = true;
var doLogSingleOccurrence = true;
var doLogJoinedOccurrence = true;
var doLogBoardDifference = true;
var doLogCleaning = true;

function println(s: string="") {
    console.log(s);
}

export function coordAsString(coord: Coord, short: boolean=false): string {
    if (short) {
        return "{" + coord.row + ", " + coord.col + "}";
    } else {
        return "{ row: " + coord.row + ", col: " + coord.col + ", box: " + coord.box + " }";
    }
}

export function posAsString(pos: number, short: boolean=false): string {
    return coordAsString(Evaluator.coord(pos), short);
}


export function logAllowOccurrenceHeader(groupName: string, iGrp: number) {
    if (!doLogOccurrences) return;

    println(groupName + " " + iGrp);
}

export function logAllowOccurrenceContent(iPos: number, allowSet: CipherSet) {
    if (!doLogOccurrences) return;

    println(posAsString(iPos) + " allows " + allowSet.toListString())
}

export function logOccurrenceCount(occCount: Map<number, number|undefined>) {
    if (!doLogOccurrences) return;

    var digit: number;
    var line = "{";
    for (digit of occCount.keys()) {
        line += " " + digit + ":" + occCount.get(digit);
    }
    println(line + " }");
}


export function logBoardEvaluationHeader() {
    if (!doLogBoardEvaluation)  return;

    println("=== Board Evaluation ===");
}

export function logBoardEvaluationContent(field: FieldContent) {
    if (!doLogBoardEvaluation)  return;

    if (field.hasDigit()) {
        println("   "+posAsString(field.pos)+" contains "+field.digit);
    } else {
        println("   "+posAsString(field.pos)+" allows "+field.allowSet.toListString());
    }
}

function allowSetAsString(field: FieldContent, short: boolean=false): string {
    var line = posAsString(field.pos, short);
    if (field.allowSet == undefined) {
        line = line + " already set."
    } else {        
        line = line + " := " + field.allowSet.toListString();
    }
    return line;
}

export function logFieldAllowSet(context: string, field: FieldContent, short: boolean=false) {
    if (!doLogAllowSet)     return;

    println(context + " " +allowSetAsString(field, short));
}

export function logCoordValue(context: string, coordValue: CoordValue, short: boolean=false) {
    if (!doLogAllowSet)     return;

    var line = coordAsString(coordValue.coord, short) + " := " + coordValue.value;
    println(context + " " + line);
}

export function logAllowSets(board: Board): void {
    if (!doLogAllowSets)     return;

    var line: string;
    var field: FieldContent;

    for (var iPos=0; iPos<81; iPos++) {
        field = board.field(iPos);
        line = posAsString(field.pos, true) + ": ";
        if (field.hasAllowSet()) {
            line = line + field.allowSet.toListString(); 
            println(line);
        }
    }
    println();
}

export function logBoard(board: Board, marked: Coord | undefined=undefined): void {
    if (!doLogBoard)    return;

    var content: number | undefined;
    var line: string;
    var iPos: number;
    var ch = " ";

    if (board.isFull()) {
        println("Board is completely filled.");
    } else {
        println("Board is NOT completely filled (" + board.unfilledFieldCount() + " unfilled).");
    }
    println(" ");

    for (let iRow of Evaluator.range) {
        line = ""
        for (let iCol of Evaluator.range) {
            line = line + ch
            if (iCol % 3 == 0) {
                line = line + "  ";
            }
            if (marked != undefined) {
                if ((marked.row == iRow) && (marked.col == iCol)) {
                    ch = "|"
                }
            }
            line = line + ch
            iPos = Evaluator.rowColAsPos(iRow, iCol);
            line = line + (board.field(iPos).hasDigit() ? board.field(iPos).digit : "_");
            line = line + ch
            if (ch == "|") {
                ch = " ";
            }
        }
        if (iRow % 3 == 0) {
            println();
        }
        println(line);
    }
    println();  
}

export function logEvaluationAreas(): void {
    if (!doLogEvaluationAreas)  return;

    logEvaluationArea("Row", "Rows", Evaluator.EvaluationAreas.row);
    logEvaluationArea("Col", "Columns", Evaluator.EvaluationAreas.col);
    logEvaluationArea("Box", "Boxes", Evaluator.EvaluationAreas.box);
}

function logEvaluationArea(singleName: string, multiName: string, areas: Array<Array<number>>): void {
    println("-- " + multiName + " --");
    var iArea: number;
    var iEntry: number;
    var line: string;

    for (iArea of Evaluator.range) {
        line = singleName + " " + iArea + ":";
        for (iEntry of Evaluator.range) {
            line = line + " " + areas[iArea][iEntry]
        }
        println(line);
    }
    println();
}

export function logSingleOccurrence(coordValue: CoordValue) {
    if (!doLogSingleOccurrence) return;

    println("Occurrence once: " + coordAsString(coordValue.coord) + "  := " + coordValue.value);
    println();
}

export function logJoinedOccurrenceHeader() {
    if (!doLogJoinedOccurrence) return;

    println();
    println("=== Base for joined Occurrence ===");
}

export function logGroupFields(groupName: string, iGrp: number, groupField: Array<FieldContent>) {
    if (!doLogJoinedOccurrence) return;

    if (groupField.length == 0) {
        return;
    }
    println(groupName + " " + iGrp);
    for (var field of groupField) {
        if (field.allowSet != undefined) {
            println("   " + posAsString(field.pos) + " = " + field.allowSet.toListString() )
        }
    }
    println();
}

export function logGroup(groupName: string, groupFields: Array<FieldContent>) {
    if (!doLogJoinedOccurrence) return;

    if (groupFields.length == 0) {
        return;
    }
    println(groupName);
    for (var field of groupFields) {
        if (field.allowSet != undefined) {
            println("   " + posAsString(field.pos) + " = " + field.allowSet.toListString() )
        }
    }
    println();
}

export function logImpossibleField(field: FieldContent) {
    println("Field " + posAsString(field.pos) + " has now allowed digits.");
}

export function logTrialField(field: FieldContent, digit: number) {
    println("Try " + posAsString(field.pos) + " = " + digit);
}

export function logBoardDifference(header: string, preBoard: Board, postBoard: Board) {
    if (!doLogBoardDifference)  return;

    var preField: FieldContent;
    var postField: FieldContent;
    var headerPrinted = false;
    var s: string;
    var contentChanged: boolean;
    var allowSetChanged: boolean;

    for (let iPos=0; iPos<81; iPos++) {
        preField = preBoard.field(iPos);
        postField = postBoard.field(iPos);

        contentChanged = !(preField.hasDigit() && postField.hasDigit() && (preField.digit == postField.digit)
                        || (!preField.hasDigit() && !postField.hasDigit()));
        allowSetChanged = !(preField.hasAllowSet() && postField.hasAllowSet() && (preField.allowSet.value == postField.allowSet.value)
                        || (!preField.hasAllowSet() && !postField.hasAllowSet()));

        if (contentChanged || allowSetChanged) {
            if (! headerPrinted) {
                println(header);
                headerPrinted = true;
            }
            s = "   " + posAsString(iPos, true);
            s += " {"
            if (contentChanged) {
                s += " contains "+preField.digit;
            }
            if (allowSetChanged) {
                s += " allows "+preField.allowSet.toListString();
            }

            s += " } => {"
            if (contentChanged) {
                s += " contains "+postField.digit;
            }
            if (allowSetChanged) {
                s += " allows "+postField.allowSet.toListString();
            }
            s += " }"
            println(s);
        }
    }

}

export function logCleaning(cleanedSubset: Array<FieldContent>, cleanedBy: CipherSet) {
    if (!doLogCleaning) return;

    var s = "   Clean {";
    for (let field of cleanedSubset) {
        s += " " + posAsString(field.pos, true) + " ";
    }
    s += "} by ";
    s += cleanedBy.toListString();
    println(s);
}
