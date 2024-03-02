import { Board } from "../board";
import { CipherSet } from "../cipherset";
import { FieldContent } from "../fieldContent";
import { logBoard } from "../logger";
import { Position } from "../position";
import { ClosedGroup, ClosedGroups } from "./closedGroups";

export class ClosedGroupFinder {
    private static INVALID_GROUP = new ClosedGroup("");

    constructor() {
    }

    findAll(board: Board): ClosedGroups {
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
            fldConts = board.fieldContents(grp).filter((fc) => fc.isEmpty() );
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
            let cnt = fldConts.length-idx0;
            let foundGroup = ClosedGroupFinder.INVALID_GROUP;
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
                            fndGrps.push(foundGroup);
                        }
            
                        this.#nextFindLevel(grpName, fldConts, fndGrps, currGrpFlds, idx+1, currAllows);    
                    }

                    currGrpFlds.pop();                        
                }
            }    
    }

    findBestClosedGroup(board: Board): ClosedGroup | undefined {
        let doLogging = false;      
        let closedGroups = this.findAll(board).sortedBySize();
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