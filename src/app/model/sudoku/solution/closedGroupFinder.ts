import { Board } from "../board";
import { CipherSet } from "../cipherset";
import { FieldContent } from "../fieldContent";
import { logBoard } from "../logger";
import { Position } from "../position";
import { ClosedGroup, ClosedGroups } from "./closedGroups";

export class ClosedGroupFinder {
    static username = "ClosedGroups";
    static EMPTY_GROUP = new ClosedGroup("");

    constructor() {
    }

    getAll(board: Board): ClosedGroups {
        let doLogging = true;
        let fldConts: FieldContent[];
        let fndGrps: ClosedGroup[];
        let closedGroups = new ClosedGroups();

        if (board.isFull()) {
            return closedGroups;
        }
        if (doLogging) {
            logBoard(board);
        }

        for (let [sGrp, grp] of Position.namedGrps()) {
            //  Aus jeder Gruppe die leeren Felder sammeln, ...
            fldConts = board.fieldContentsOf(grp).filter((fc) => fc.isEmpty() );
            if (fldConts.length >= 3) {
                //  ... wenn es mehr als 3 leere Felder sind ...
                fndGrps = [];
                //  ... dann die geschlossenen (Unter)gruppen sammeln
                this.#nextFindLevel(sGrp, fldConts, fndGrps);
                if (fndGrps.length > 0) {
                    //  Wenn geschlossene Gruppen gefunden wurden, ...
                    for (let cg of fndGrps) {
                        //  ... dann die Anzahl der Felder zählen, die in den übrigen
                        //  Feldern entfernt würden und ...
                        let cleanLevel = cg.cleaningLevel(board);
                        if (doLogging) {
                            console.log("["+cleanLevel+"] " + cg.toString());
                        }
                        //  ... wenn wirklich Felder entfernt würden, die Gruppe speichern
                        if (cleanLevel > 0) {
                            closedGroups.add(cg);
                        }
                    }
                }
            }
        }
        return closedGroups;
    }

    solveOne(board: Board, group: ClosedGroup): boolean {
        let doLogging = true;
        let cleanLevel = group.cleaningLevel(board);

        if (doLogging) {
            console.log("["+cleanLevel+"] " + group.toString());
        }
        if (cleanLevel > 0) {
            group.apply(board);
            return true;
        }
        return false;
    }

    solveAllYY(board: Board): boolean {
        let solvedSomething = false;
        let groups = this.getAll(board);

        for (let group of groups.groups) {
            solvedSomething ||= this.solveOne(board, group);
        }
        return solvedSomething;
    }

    solveAll(board: Board): boolean {
        let doLogging = true;
        let fldConts: FieldContent[];
        let fndGrps: ClosedGroup[];
        let hasSolved = false;

        if (board.isFull()) {
            return false;
        }
        if (doLogging) {
            logBoard(board);
        }
        
        for (let [sGrp, grp] of Position.namedGrps()) {
            fldConts = board.fieldContentsOf(grp).filter((fc) => fc.isEmpty() );
            if (fldConts.length >= 3) {
                fndGrps = [];
                this.#nextFindLevel(sGrp, fldConts, fndGrps);
                if (fndGrps.length >= 0) {
                    for (let cg of fndGrps) {
                        let cleanLevel = cg.cleaningLevel(board);
                        if (doLogging) {
                            console.log("["+cleanLevel+"] " + cg.toString());
                        }
                        if (cleanLevel > 0) {
                            hasSolved ||= this.#solveOneClosedGroup(board, sGrp, fldConts);
                        }
                    }
                }
            }
        }
        return hasSolved;
    }

    #solveOneClosedGroup(board: Board, grpName: string, fldConts: FieldContent[], 
        currGrpFlds: FieldContent[]=[], idx0: number=0, prevAllows: CipherSet=new CipherSet()): boolean {
            let cnt = fldConts.length-idx0;
            let foundGroup = ClosedGroupFinder.EMPTY_GROUP;
            let currAllows : CipherSet;

            if (cnt >= 2) {
                for (let idx=idx0; idx < fldConts.length; idx++) {
                    currAllows = prevAllows.or(fldConts[idx].allowSet);

                    currGrpFlds.push(fldConts[idx]);

                    if (currAllows.length < currGrpFlds.length) {
                        // Irgendwas ist hier schiefgelaufen.
                        console.error();
                        console.error("CurrAllows.length less than currGrpFlds.length");
                        console.error("   CurrAllows: " + currAllows.toListString());
                        console.error("   CurrGrpFlds:");
                        for (let fc of currGrpFlds) {
                            console.error("      " + fc.toString());
                        }
                    } else {
                        if (currAllows.length == currGrpFlds.length) {
                            foundGroup = ClosedGroup.of(grpName, currGrpFlds, currAllows);
                            foundGroup.apply(board);
                            return true;
                        }
            
                        if (this.#solveOneClosedGroup(board, grpName, fldConts, currGrpFlds, idx+1, currAllows)) {
                            return true;
                        }
                    }

                    currGrpFlds.pop();                        
                }
            }
            return false;
    }

    #nextFindLevel(grpName: string, fldConts: FieldContent[], fndGrps: ClosedGroup[], 
        currGrpFlds: FieldContent[]=[], idx0: number=0, prevAllows: CipherSet=new CipherSet()) {
        //  Geschlossene (Unter)Gruppen suchen und beim Index idx0 beginnen
        let cnt = fldConts.length-idx0;

        if (cnt >= 2) {
            //  Wenn mehr als 2 Felder übrig sind
            let foundGroup = ClosedGroupFinder.EMPTY_GROUP;
            let currAllows : CipherSet;
                
            for (let idx=idx0; idx < fldConts.length; idx++) {
                //  Für jeden Startindex die erlaubten Ziffern sammeln und
                //  das zugehörige Feld merken
                currAllows = prevAllows.or(fldConts[idx].allowSet);
                currGrpFlds.push(fldConts[idx]);

                if (currAllows.length < currGrpFlds.length) {
                    //  Es gibt weniger erlaubte Ziffern als untersuchte Felder
                    //  Kann eigentlich nicht sein
                    console.error();
                    console.error("CurrAllows.length less than currGrpFlds.length");
                    console.error("   CurrAllows: " + currAllows.toListString());
                    console.error("   CurrGrpFlds:");
                    for (let fc of currGrpFlds) {
                        console.error("      " + fc.toString());
                    }
                } else {
                    if (currAllows.length == currGrpFlds.length) {
                        //  Wenn die Anzahl der untersuchten Felder genau der Anzahl
                        //  insgesamt erlaubter Ziffern entspricht, haben wir eine
                        //  geschlossene Gruppe gefunden.
                        //  Also merken:
                        foundGroup = ClosedGroup.of(grpName, currGrpFlds, currAllows);
                        fndGrps.push(foundGroup);
                    }
                    //  In jedem Fall beim nächsten Index weitersuchen:
                    this.#nextFindLevel(grpName, fldConts, fndGrps, currGrpFlds, idx+1, currAllows);    
                }
                //  Mit dem Feld am aktuellen Index sind wir fertig, also das Feld
                //  (es ist das letzte) aus der Merkliste wieder entfernen
                currGrpFlds.pop();                        
            }
        }    
    }

    findBestClosedGroup(board: Board): ClosedGroup | undefined {
        let doLogging = false;      
        let closedGroups = this.getAll(board).sortedBySize();
        let bestLevel = 0;
        let bestLength = 9;
        let bestGroup = undefined;

        for (let closedGroup of closedGroups) {
            let level = closedGroup.cleaningLevel(board);
            if (level > 0) {
                if (bestGroup === undefined) {
                    bestLevel = level;
                    bestGroup = closedGroup;
                    bestLength = closedGroup.length;                
                } else {
                    if (level > bestLevel) {
                        bestLevel = level;
                        bestGroup = closedGroup;
                        bestLength = closedGroup.length;                
                    } else if (level == bestLevel) {
                        if (closedGroup.length < bestLength) {
                            bestLevel = level;
                            bestGroup = closedGroup;
                            bestLength = closedGroup.length;                    
                        }
                    }
                }
            }
        }
        if (doLogging) {
            if (bestLevel > 0) {
                console.log("Best Closed Group would clean " + bestLevel + " digits by " + bestLength + " length.");
            } else {
                console.log("No usable closed group found.");
            }
        }
        return bestGroup;
    }
}