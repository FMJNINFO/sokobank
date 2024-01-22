import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { Move } from "./move";
import { Position } from "./position";

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

export function logAllowOccurrenceHeader(groupName: string, iGrp: number) {
    if (!doLogOccurrences) return;

    println(groupName + " " + iGrp);
}

export function logAllowOccurrenceContent(pos: Position, allowSet: CipherSet) {
    if (!doLogOccurrences) return;

    println(pos.toString() + " allows " + allowSet.toListString())
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

export function logBoardEvaluationContent(fieldContent: FieldContent) {
    if (!doLogBoardEvaluation)  return;

    if (fieldContent.isEmpty()) {
        println("   "+fieldContent.pos.toString()+" allows "+fieldContent.allowSet.toListString());
    } else {
        println("   "+fieldContent.pos.toString()+" contains "+fieldContent.digit);
    }
}

function allowSetAsString(fieldContent: FieldContent): string {
    var line = fieldContent.pos.toString();
    if (fieldContent.allowSet == undefined) {
        line = line + " already set."
    } else {        
        line = line + " := " + fieldContent.allowSet.toListString();
    }
    return line;
}

export function logFieldAllowSet(context: string, fieldContent: FieldContent) {
    if (!doLogAllowSet)     return;

    println(context + " " +allowSetAsString(fieldContent));
}

export function logCoordValue(context: string, move: Move) {
    if (!doLogAllowSet)     return;

    var line = move.pos.toString() + " := " + move.value;
    println(context + " " + line);
}

export function logAllowSets(board: Board): void {
    if (!doLogAllowSets)     return;

    var line: string;
    var fieldContent: FieldContent;
    var pos: Position;

    for (var iPos=0; iPos<81; iPos++) {
        pos = Position.of(iPos);
        fieldContent = board.fieldContent(pos);
        line = fieldContent.pos.toString() + ": ";
        if (fieldContent.isEmpty()) {
            line = line + fieldContent.allowSet.toListString(); 
            println(line);
        }
    }
    println();
}

export function logBoard(board: Board, marked: Position | undefined=undefined): void {
    if (!doLogBoard)    return;

    var line: string;
    var pos: Position;
    var ch = " ";

    if (board.isFull()) {
        println("Board is completely filled.");
    } else {
        println("Board is NOT completely filled (" + board.emptyFields() + " unfilled).");
    }
    println(" ");

    for (let iRow=0; iRow<9; iRow++) {
        line = ""
        for (let iCol=0; iCol<9; iCol++) {
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
            pos = Position.of(iRow * 9 + iCol);
            line = line + (board.fieldContent(pos).hasDigit() ? board.fieldContent(pos).digit : "_");
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

    // logEvaluationArea("Row", "Rows", Evaluator.EvaluationAreas.row);
    // logEvaluationArea("Col", "Columns", Evaluator.EvaluationAreas.col);
    // logEvaluationArea("Box", "Boxes", Evaluator.EvaluationAreas.box);
}

// function logEvaluationArea(singleName: string, multiName: string, areas: Array<Array<number>>): void {
//     println("-- " + multiName + " --");
//     var iArea: number;
//     var iEntry: number;
//     var line: string;

//     for (iArea of Evaluator.range) {
//         line = singleName + " " + iArea + ":";
//         for (iEntry of Evaluator.range) {
//             line = line + " " + areas[iArea][iEntry]
//         }
//         println(line);
//     }
//     println();
// }

export function logSingleOccurrence(move: Move) {
    if (!doLogSingleOccurrence) return;

    println("Occurrence once: " + move.pos.toString() + "  := " + move.value);
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
    for (var fieldContent of groupField) {
        if (fieldContent.allowSet != undefined) {
            println("   " + fieldContent.pos.toString() + " = " + fieldContent.allowSet.toListString() )
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
    for (var fieldContent of groupFields) {
        if (fieldContent.allowSet != undefined) {
            println("   " + fieldContent.pos.toString() + " = " + fieldContent.allowSet.toListString() )
        }
    }
    println();
}

export function logImpossibleField(fieldContent: FieldContent) {
    println("Field " + fieldContent.pos.toString() + " has now allowed digits.");
}

export function logTrialField(fieldContent: FieldContent, digit: number) {
    println("Try " + fieldContent.pos.toString() + " = " + digit);
}

export function logBoardDifference(header: string, preBoard: Board, postBoard: Board) {
    if (!doLogBoardDifference)  return;

    var preField: FieldContent;
    var postField: FieldContent;
    var headerPrinted = false;
    var s: string;
    var contentChanged: boolean;
    var allowSetChanged: boolean;
    var pos: Position;

    for (let iPos=0; iPos<81; iPos++) {
        pos = Position.of(iPos);
        preField = preBoard.fieldContent(pos);
        postField = postBoard.fieldContent(pos);

        contentChanged = !(preField.hasDigit() && postField.hasDigit() && (preField.digit == postField.digit)
                        || (preField.isEmpty() && postField.isEmpty()));
        allowSetChanged = !(preField.isEmpty() && postField.isEmpty() && (preField.allowSet.value == postField.allowSet.value)
                        || (preField.hasDigit() && postField.hasDigit()));

        if (contentChanged || allowSetChanged) {
            if (! headerPrinted) {
                println(header);
                headerPrinted = true;
            }
            s = "   " + pos.toString();
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
    for (let fieldContent of cleanedSubset) {
        s += " " + fieldContent.pos.toString() + " ";
    }
    s += "} by ";
    s += cleanedBy.toListString();
    println(s);
}
