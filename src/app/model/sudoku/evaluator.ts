import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { logImpossibleField } from "./logger";

function ndiv(dividend: number, divisor: number): number {
    return (dividend - (dividend % divisor)) / divisor;
}

function nmod(dividend: number, divisor: number): number {
    return dividend % divisor;
}

export interface Coord {
    row: number,
    col: number,
    box: number
}

export interface CoordValue {
    coord: Coord,
    value: number;
}

export class Evaluator {
    static range: Array<number> = [0,1,2,3,4,5,6,7,8];
    static EvaluationAreas = this.initEvaluationAreas();

    static initEvaluationAreas() {
        var iRow: number;
        var iCol: number;
        var iBox: number;

        var groups = new Map<string, Array<number>>();

        var rows: Array<Array<number>> = []; 
        for (iRow of Evaluator.range) {
            rows[iRow] = new Array<number>();
            for (iCol of Evaluator.range) {
                rows[iRow][iCol] = iRow*9 + iCol
            }
            groups.set("Row"+iRow, rows[iRow]);
        }

        var cols: Array<Array<number>> = []; 
        for (iCol of Evaluator.range) {
            cols[iCol] = new Array<number>();
            for (iRow of Evaluator.range) {
                cols[iCol][iRow] = rows[iRow][iCol]
            }
            groups.set("Col"+iCol, cols[iCol]);
//            groups.set("Col"+iCol, rows[iCol]);
        }

        var boxs: Array<Array<number>> = []; 
        for (iBox of Evaluator.range) {
            boxs[iBox] = new Array<number>();
            iRow = iBox % 3;
            iCol = (iBox-iRow) / 3;
            var fld0 = (iCol * 27) + (iRow * 3);
            for (var nRow of [0,1,2]) {
                for (var nCol of [0,1,2]) {
                    boxs[iBox][(nRow*3)+nCol] = fld0+nCol;                    
                }
                fld0 = fld0 + 9
            }
            groups.set("Box"+iBox, boxs[iBox]);
        }
        return { row: rows, col: cols, box: boxs, groups: groups };
    }

    get row(): Array<Array<number>> {
        return Evaluator.EvaluationAreas.row;
    }

    get col(): Array<Array<number>> {
        return Evaluator.EvaluationAreas.col;
    }

    get box(): Array<Array<number>> {
        return Evaluator.EvaluationAreas.box;
    }

    get groups(): Map<string, Array<number>> {
        return Evaluator.EvaluationAreas.groups;
    }

    static coord(iPos: number): Coord {
        let iCol    = nmod(iPos, 9);
        let iRow    = ndiv(iPos, 9);
        let iBox    = 3 * ndiv(iPos, 27) + ndiv(iCol, 3);
        return {row: iRow, col: iCol, box: iBox};
    }

    static rowColAsPos(iRow: number, iCol: number) {
        return (iRow * 9) + iCol;
    }

    getRow(coord: Coord): Array<number> {
        return this.row[coord.row];
    }

    getCol(coord: Coord): Array<number> {
        return this.col[coord.col];
    }

    getBox(coord: Coord): Array<number> {
        return this.box[coord.box];
    }

    allowedInGroup(board: Board, group: Array<number>): CipherSet {
        var used = [];
        var field: FieldContent;
        for (var iPos of group) {
            field = board.field(iPos);
            if (field.hasDigit()) {
                used.push(field.digit);
            }
        }
        var cs = new CipherSet(...used);
        var ret = cs.not(); 
        return ret;
    }

    allowedInField(board: Board, iPos: number): CipherSet {
        var coord = Evaluator.coord(iPos);
        var allowed = this.allowedInGroup(board, this.getRow(coord));
        allowed = allowed.and(this.allowedInGroup(board, this.getCol(coord)));
        allowed = allowed.and(this.allowedInGroup(board, this.getBox(coord)));

        return allowed;
    }

    // evaluateBoard(board: Board) {
    //     var field: FieldContent;

    //     logBoardEvaluationHeader();

    //     for (var iPos=0; iPos<81; iPos++) {
    //         field = board.field(iPos);
    //         if (field.hasAllowSet()) {
    //             field.setAllowSet(this.allowedInField(board, iPos));
    //         }
    //         logBoardEvaluationContent(field);
    //     }
    // }

    checkBoard(board: Board): boolean {
        var ok = true;
        var field: FieldContent;

        for (var iPos=0; iPos<81; iPos++) {
            field = board.field(iPos);
            if (field.digit == undefined) {
                if (field.allowSetLength == 0) {
                    logImpossibleField(field);
                    ok = false;
                }
            }
        }
        return ok;
    }

    eqCoordValue(cv1: CoordValue, cv2: CoordValue | undefined): boolean {
        if (cv2 == undefined) {
            return false;
        }
        if (cv1.coord.row != cv2.coord.row) {
            return false;
        }
        if (cv1.coord.col != cv2.coord.col) {
            return false;
        }
        if (cv1.value != cv2.value) {
            return false;
        }
        return true;
    }
}