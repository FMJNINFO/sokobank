import { Board, BoardError } from "../board";
import { CipherSet } from "../cipherset";
import { FieldContent } from "../fieldContent";
import { logBoard, loggingActive } from "../logger";
import { Position } from "../position";
import { ClosedGroup, ClosedGroups } from "./closedGroups";

export class ClosedGroupFinder {
    static username = "ClosedGroups";
    static EMPTY_GROUP = new ClosedGroup("");

    constructor() {
    }

    getAll(board: Board): ClosedGroups {
        let doLogging = false;
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
                        if (doLogging && loggingActive) {
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

    #nextFindLevel(grpName: string, fldConts: FieldContent[], fndGrps: ClosedGroup[], 
        currGrpFlds: FieldContent[]=[], idx0: number=0, prevAllows: CipherSet=new CipherSet()) {    
        let doLogging = false;

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
                    if (doLogging) {
                        console.error();
                        console.error("CurrAllows.length less than currGrpFlds.length");
                        console.error("   CurrAllows: " + currAllows.toListString());
                        console.error("   CurrGrpFlds:");
                        for (let fc of currGrpFlds) {
                            console.error("      " + fc.toString());
                        }
                    }
                    fndGrps = []
                    throw new BoardError("Error in closed group, because of board inconsitencies.");
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
}