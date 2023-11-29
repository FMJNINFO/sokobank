import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { Evaluator } from "./evaluator";
import { FieldContent } from "./fieldContent";
import { logBoardDifference, logCleaning, logGroupFields } from "./logger";
import { SubArray } from "./subarray";


export class ClosedSubgroupJoiner {
    //  Check if there a joined fields that are a closed subgroup,
    //  that is, they contain a subgroup of the remaining digits.
    //  In that case these digit can be removed of the other allow sets.
    //  
    evaluator = new Evaluator();

    constructor() {

    }

    cleanAll(board: Board): boolean {
        var startBoard = board.copy();
        var groups = this.evaluator.groups;
        var group: number[] | undefined;
        var groupName: string;
        console.log(" ");
        console.log("=== Cleaning ===");
        for (groupName of groups.keys()) {
            group = groups.get(groupName);
            if (group != undefined) {
                if (this.cleanByJoinedSubgroup(board, groupName, group)) {
                    logBoardDifference("   --- CLEANED ---", startBoard, board);
                    return true;
                }
            }
        }
        console.log("--- Nothing to clean ---");
        console.log(" ");
        return false;
    }

    cleanUntilOneFound(board: Board): boolean {
        var startBoard = board.copy();
        var groups = this.evaluator.groups;
        var group: number[] | undefined;
        var groupName: string;
        console.log(" ");
        console.log("=== Cleaning ===");
        for (groupName of groups.keys()) {
            group = groups.get(groupName);
            if (group != undefined) {
                if (this.cleanByJoinedSubgroup(board, groupName, group)) {
                    logBoardDifference("   --- CLEANED ---", startBoard, board);
                    return true;
                }
            }
        }
        console.log("--- Nothing to clean ---");
        console.log(" ");
        return false;
    }

    cleanByJoinedSubgroup(board: Board, groupName: string, group: number[]): boolean {
        var groupFields = new Array<FieldContent>();
        var field: FieldContent;

        //  Sammelt alle Felder der Gruppe ohne Content ein
        for (var iOfs of Evaluator.range) {
            field = board.field(group[iOfs]);
            if (!field.hasDigit()) {
                groupFields.push(field);
            }
        }

        //  Sinnvoll ist das Ganze nur, wenn es noch mindestens 3 Felder gibt
        if (groupFields.length > 2) {
            //  Sortiert nach Anzahl der möglichen Ziffern, kleinere Anzahl zuerst
            groupFields.sort((f1, f2) => f1.allowSetLength - f2.allowSetLength);        
            logGroupFields(groupName, 0, groupFields);

            var subarray: SubArray;
            var joinedAllow: CipherSet;

            //  Die Teilmenge der Grösse nach von 2 bis Länge-Gesamtgruppe-1 durchlaufen
            for (var sublength=2; sublength<groupFields.length; sublength++) {            
                //  Teilmengen der aktuellen Länge konstruieren; diese Teilmengen enthalten Indizes
                subarray = new SubArray(groupFields.length, sublength);

                var subgroupFields: Array<FieldContent>;
                var currentJoinPlan: Array<number> | undefined;            
                while ((currentJoinPlan = subarray.next()) != undefined) {
                    //  Nacheinander jede Teilmenge bearbeiten, bis keine mehr da ist

                    //  Die zu den Indizes des aktuellen Joinplans gehörigen Felder holen
                    subgroupFields = this._subgroupFields(groupFields, currentJoinPlan);

                    //  Die erlaubten Werte der Felder zusammenfassen, die über die Indexteilmenge definiert sind
                    joinedAllow = this._joinedAllowOccurrence(subgroupFields);
                    if (currentJoinPlan.length == joinedAllow.length) {
                        // logCleaning(subgroupFields, joinedAllow);
                        if (this._cleanJoinedSubset(joinedAllow.not(), groupFields, currentJoinPlan)) {
                            logCleaning(subgroupFields, joinedAllow);
                            return true;
                        }
                    }
                }
            }    
        }
        return false;
    }

    _subgroupFields(groupFields: Array<FieldContent>, joinPlan: Array<number>): Array<FieldContent> {
        var subgroupFields = new Array<FieldContent>();
        for (let iPlan=0; iPlan<joinPlan.length; iPlan++) {
            subgroupFields.push(groupFields[joinPlan[iPlan]]);
        }
        return subgroupFields;
    }

    _cleanJoinedSubset(leftAllowSet: CipherSet, groupFields: Array<FieldContent>, joinPlan: Array<number>): boolean {
        //  Aus allen Felder des Board, die nicht beim JoinPlan verwendet wurden, alles bis auf
        //  die übergebene Ziffernmenge leftAllowSet entfernen
        //
        var cleaned = false;
        var initialAllowSet: CipherSet | undefined;
        var cleanedAllowSet: CipherSet;
        for (let iFld=0; iFld<groupFields.length; iFld++) {
            if (!joinPlan.includes(iFld)) {
                initialAllowSet = groupFields[iFld].allowSet;
                if (initialAllowSet != undefined) {
                    cleanedAllowSet = initialAllowSet.and(leftAllowSet);
                    if (cleanedAllowSet.length < initialAllowSet.length) {
                        groupFields[iFld].setAllowSet(cleanedAllowSet);
                        cleaned = true;
                    }
                }
            }
        }
        return cleaned;
    }

    _joinedAllowOccurrence(subgroupFields: Array<FieldContent>): CipherSet {
        //  Fasst die erlaubten Werte, der vom currentJoinPlan (die Indizes in der Gruppe) ausgewählten 
        //  Felder in einem CipherSet zusammen und gibt sie zurück
        //
        var joinedAllow = new CipherSet();
        for (let field of subgroupFields) {
            if (field.allowSet != undefined) {
                joinedAllow = joinedAllow.or(field.allowSet);
            }
        }
        return joinedAllow;
    }

}