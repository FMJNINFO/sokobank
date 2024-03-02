import { Board } from "./board";
import { FieldContent } from "./fieldContent";
import { Position } from "./position";

let doLogBoard = true;
let doLogBoardEvaluation = false;

export function message(s: string) {
    alert(s);
}

function println(s: string="") {
    console.log(s);
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
        println("   "+fieldContent.pos.toString()+" contains "+fieldContent.digit());
    }
}

export function logBoard(board: Board, marked: Position | undefined=undefined): void {
    if (!doLogBoard)    return;

    let line: string;
    let pos: Position;
    let ch = " ";
    let digitChar: string;
    let fc: FieldContent;

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
            fc = board.fieldContent(pos);
            if (fc.hasDigit()) {
                digitChar = fc.digit().toString();
            } else {
                if (fc.allowSet.isEmpty()) {
                    digitChar = "*"
                } else {
                    digitChar = "_";
                }
            }
            line = line + digitChar;
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
