import { count } from "rxjs";
import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { CoordValue, Evaluator } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { IFinder } from "./finder";
import { posAsString } from "./logger";



export class HiddenAllowanceInGroups implements IFinder {
    evaluator = new Evaluator();

    constructor() {

    }

    find(board: Board): Array<CoordValue> {
        var group: number[] | undefined;
        var groups = this.evaluator.groups;
        var openGroupFields: Array<FieldContent>;
        var groupFields: Array<FieldContent>;
        var depth = 2;

        for (depth=2; depth<=5; depth++) {
            for (var groupName of groups.keys()) {                
                group = groups.get(groupName);
                if (group != undefined) {
                    groupFields = board.fields(group);
                    openGroupFields = board.fields(group).filter(field => field.hasAllowSet());
                    if (this.countGroupAllowDigits(groupName, openGroupFields, 2)) {
                        console.log("--- found ---");                    
                    }
                }
            }
        }
        return [];
    }

    countGroupAllowDigits(groupName: string, groupFields: Array<FieldContent>, depth: number): boolean {
        var depthFields = this.depthAllowanceFields(groupFields, depth);

        if (depthFields.length == 0) {
            return false;
        }
        console.log("=== Found fitting fields ===");
        console.log("   " + groupName);
        for (var depthField of depthFields) {
            for (var field of depthField) {
                console.log("   " + posAsString(field.pos) + ": " + field.allowSet.toListString());                
            }
            console.log("");
        }

        return true;
    }

    depthAllowanceFields(fields: Array<FieldContent>, depth: number): Array<Array<FieldContent>> {
        //  Alle Felder mit der benötigten Ziffer-Häufigkeit suchen
        var multiFields = new Array<Array<FieldContent>>();
        for (var field of fields) {
            if (field.allowSetLength == depth) {
                multiFields.push([field]);
            }
        }
        
        //  Alle weiteren Felder suchen, in denen die oben gefundenen Ziffern vorkommen
        for (var multiField of multiFields) {
            var candidates = new Array<FieldContent>();
            var valid = true;
            for (var field of fields) {
                if (field.pos != multiField[0].pos) {
                    var intersectionLength = multiField[0].allowSet.and(field.allowSet).length;
                    if (intersectionLength == depth) {
                        candidates.push(field);
                    } else {
                        if (intersectionLength > 0) {
                            valid = false;
                        }
                    }
                }
            }
            if (valid) {
                multiField.concat(candidates);
            }
        }

        var depthFields = new Array<Array<FieldContent>>();
        for (var multiField of multiFields) {
            if (multiField.length == depth) {
                depthFields.push(multiField);
            }
        }
        return depthFields;
    }

    findNext(board: Board): CoordValue | undefined {
        return undefined;
    }
}