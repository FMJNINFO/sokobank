import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { Evaluator, CoordValue } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { IFinder } from "./finder";
import { logJoinedOccurrenceHeader, logGroupFields, coordAsString, logAllowSets, logBoard, logSingleOccurrence, logGroup } from "./logger";
import { SubArray } from "./subarray";



export class AllowanceRemovingClosedGroup implements IFinder {
    evaluator = new Evaluator();

    constructor() {

    }

    find(board: Board): Array<CoordValue> {
        // var groupFields = new Array<FieldContent>();
        var foundValues: Array<CoordValue> = [];
        var group: number[] | undefined;
        var groups = this.evaluator.groups;
        // var groupFields: Array<FieldContent>;
        var openGroupFields: Array<FieldContent>;

        logJoinedOccurrenceHeader();
        
        for (var groupName of groups.keys()) {                
            group = groups.get(groupName);
            if (group != undefined) {
                // groupFields = board.fields(group);
                openGroupFields = board.fields(group).filter(field => field.hasAllowSet());
                openGroupFields.sort((f1, f2) => f1.allowSetLength - f2.allowSetLength);
                logGroup(groupName, openGroupFields);
                if (openGroupFields.length > 0) {
                    this._groupAllowJoinedOccurrences(openGroupFields, foundValues);
                }
            }
        }
        return foundValues;
    }

    findNext(board: Board): CoordValue | undefined {
        var groupFields = new Array<FieldContent>();
        var coordValue: CoordValue | undefined;

        logJoinedOccurrenceHeader();
        
        for (var iGrp of Evaluator.range) {
            groupFields = this._collectGroupFields(board, this.evaluator.row[iGrp]);
            groupFields.sort((f1, f2) => f1.allowSetLength - f2.allowSetLength);
            logGroupFields("Row", iGrp, groupFields);
            if (groupFields.length > 0) {
                coordValue = this._groupAllowJoinedOccurrence(groupFields);
                if (coordValue != undefined) {
                    break;
                }
            }
        }
        if (coordValue == undefined) {
            for (var iGrp of Evaluator.range) {
                groupFields = this._collectGroupFields(board, this.evaluator.col[iGrp]);
                groupFields.sort((f1, f2) => f1.allowSetLength - f2.allowSetLength);
                logGroupFields("Col", iGrp, groupFields);
                if (groupFields.length > 0) {
                    coordValue = this._groupAllowJoinedOccurrence(groupFields);
                    if (coordValue != undefined) {
                        break;
                    }
                }
            }
        }
        if (coordValue == undefined) {
            for (var iGrp of Evaluator.range) {
                groupFields = this._collectGroupFields(board, this.evaluator.box[iGrp]);
                groupFields.sort((f1, f2) => f1.allowSetLength - f2.allowSetLength);
                logGroupFields("Box", iGrp, groupFields);
                if (groupFields.length > 0) {
                    coordValue = this._groupAllowJoinedOccurrence(groupFields);
                    if (coordValue != undefined) {
                        break;
                    }
                }
            }
        }

        if (coordValue == undefined) {
            logAllowSets(board);    
            logBoard(board);
            console.log("--- END OF TEST ---");  
        } else {
            console.log("=== We found something ===");  
            logSingleOccurrence(coordValue);
        }

        return coordValue;
    }

    _collectGroupFields(board: Board, group: Array<number>): Array<FieldContent> {
        //  Sammelt Board-Fields einer Gruppe zusammen und gibt sie zurück

        var groupFields = new Array<FieldContent>();
        var field: FieldContent;

        for (var iOfs of Evaluator.range) {
            field = board.field(group[iOfs]);
            if (!field.hasDigit()) {
                groupFields.push(field);
            }
        }

        return groupFields;
    }

    _joinSubarrayAllowance(subarray: SubArray, groupFields: Array<FieldContent>, coordValues: Array<CoordValue>) {
        var joinedAllow: CipherSet | undefined;
        var current: Array<number> | undefined;
        var foundValue: CoordValue | undefined;

        while ((current = subarray.next()) != undefined) {
            joinedAllow = this._joinedAllowOccurrence(groupFields, current);
            if (joinedAllow != undefined) {
                if (current.length == joinedAllow.length) {
                    console.log("      Check current: " + current + " -> " + joinedAllow.toListString());
                    foundValue = this._checkJoinOfAllowOccurrence(groupFields, current, joinedAllow.not());
                }
            }
            if (foundValue != undefined) {
                if (!coordValues.some((cv) => this.evaluator.eqCoordValue(cv, foundValue))) {
                    coordValues.push(foundValue);
                }
            }
        }          
        return coordValues;
    }

    _groupAllowJoinedOccurrences(groupFields: Array<FieldContent>, foundValues: Array<CoordValue>) {
        //  Prüft zunächst, ob es in den groupFields eine Teilmenge mit mehr als zwei Felder
        //  gibt, die laut ihrer allowSets nur eine Teilmenge der Einträge mit gleicher
        //  Groesse enthält. Damit entfallen diese Einträge für alle anderen Felder.
        //  Dann wird geprüft, ob diese anderen Felder laut allowSet, nach Entfernung dieser
        //  entfallenden Einträge nur noch eine bestimmten Eintrag enthalten dürfen.
        //  Dieser wird dann zurückgegeben.
        
        var subarray: SubArray;

        if (groupFields.length > 2) {
            for (var sublength=2; sublength<groupFields.length; sublength++) {
                subarray = new SubArray(groupFields.length, sublength);
                this._joinSubarrayAllowance(subarray, groupFields, foundValues);
            }
        }
    }

    _groupAllowJoinedOccurrence(groupFields: Array<FieldContent>): CoordValue | undefined {
        //  Prüft zunächst, ob es in den groupFields eine Teilmenge mit mehr als zwei Felder
        //  gibt, die laut ihrer allowSets nur eine Teilmenge der Einträge mit gleicher
        //  Groesse enthält. Damit entfallen diese Einträge für alle anderen Felder.
        //  Dann wird geprüft, ob diese anderen Felder laut allowSet, nach Entfernung dieser
        //  entfallenden Einträge nur noch eine bestimmten Eintrag enthalten dürfen.
        //  Dieser wird dann zurückgegeben.
        
        var subarray: SubArray;
        var foundCoordValue: CoordValue | undefined;
        var joinedAllow: CipherSet | undefined;
        if (groupFields.length > 2) {
            for (var sublength=2; sublength<groupFields.length; sublength++) {
                subarray = new SubArray(groupFields.length, sublength);

                var current: Array<number> | undefined;
                while ((current = subarray.next()) != undefined) {
                    joinedAllow = this._joinedAllowOccurrence(groupFields, current);
                    if (joinedAllow != undefined) {
                        if (current.length == joinedAllow.length) {
                            console.log("      Check current: " + current + " -> " + joinedAllow.toListString());
                            foundCoordValue = this._checkJoinOfAllowOccurrence(groupFields, current, joinedAllow.not());
                        }
                    }
                    if (foundCoordValue != undefined) {
                        return foundCoordValue;
                    }
                }          
            }
        }
        return undefined;
    }

    _joinedAllowOccurrence(groupFields: Array<FieldContent>, currentJoinPlan: Array<number>): CipherSet | undefined {
        //  Fasst die erlaubten Werte, der vom currentJoinPlan ausgewählten Felder in einem
        //  CipherSet zusammen und gibt sie zurück

        var iPlan = 0;
        var field = groupFields[currentJoinPlan[iPlan]];
        var joinedAllow = field.allowSet;
        for (iPlan=1; iPlan<currentJoinPlan.length; iPlan++) {
            field = groupFields[currentJoinPlan[iPlan]];
            if (field.allowSet != undefined) {
                joinedAllow = joinedAllow?.or(field.allowSet);
            }
        }
        return joinedAllow;
    }

    _checkJoinOfAllowOccurrence(groupFields: Array<FieldContent>, currentJoinPlan: Array<number>, joinedAllowHide: CipherSet): CoordValue | undefined {
        //  Prüft alle Felder der groupFields, die nicht im currentJoinPlan enthalten sind, ob eines davon
        //  von den laut joinedAllowHide erlaubten Inhalten nur einen Wert enthaelt und liefert ihn zurück.

        var disjunctAllow: CipherSet;
        var field: FieldContent;
        for (var iFieldOfs=0; iFieldOfs<groupFields.length; iFieldOfs++) {
            if (!currentJoinPlan.includes(iFieldOfs)) {
                field = groupFields[iFieldOfs];
                if (field.allowSet != undefined) {
                    disjunctAllow = field.allowSet.and(joinedAllowHide);
                    if (disjunctAllow.length == 1) {
                        var coord = Evaluator.coord(field.pos);
                        console.log("         " + coordAsString(coord) + " fits with " + disjunctAllow.toListString());
                        var foundCoordValue = { coord: coord, value: disjunctAllow.entries[0]};
                        return foundCoordValue;
                    }
                }
            }
        }
        return undefined;
    }
}
