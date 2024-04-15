import { Board, Cheat } from "../board";
import { CipherSet } from "../cipherset";
import { FieldContent } from "../fieldContent";
import { Position } from "../position";
import { Cause } from "../cause";
import { loggingActive } from "../logger";

export class ClosedGroup implements Cheat {
    static NO_CLOSED_GROUP = new ClosedGroup("");

    _poss: Position[];
    _grpName: string;
    _allows: CipherSet;

    constructor(groupName: string) {
        this._grpName = groupName;
        this._poss = [];
        this._allows = new CipherSet();
    }

    get cause(): Cause {
        return Cause.CLOSED_GROUP;
    }
    
    affectedBy(pos: Position): boolean {
        for (let p of this._poss) {
            if (p.pos == pos.pos) {
                return true;
            }
        }
        return false;
    }

    get length(): number {
        return this._poss.length;
    }

    toString(): string {
        if (this._poss.length == 0) {
            return "Closed group " + this._grpName + " is empty.";
        }
        return "Closed group for " + this._grpName + ": " + this._allows.toListString() + " -> " + this._poss;
    }

    cleaningLevel(board: Board) {
        let doLogging = false;
        let fcGroup = board.fieldContentsOf(this._poss);
        let possGroupSet = new Set(fcGroup.map((fc) => fc.pos));

        let group = Position.namedGroup(this._grpName);
        let possClean = board.fieldContentsOf(group)
                        .filter((fc) => fc.isEmpty())
                        .map((fc) => fc.pos)
                        .filter((pos) => !possGroupSet.has(pos))

        let cleanAllow = this._allows.not()
        let level = 0;
        for (let pos of possClean) {
            let fcToClean = board.fieldContentOf(pos);
            let cleanedAllow = fcToClean.allowSet.and(cleanAllow);
            level += fcToClean.allowSet.length - cleanedAllow.length;
        }
        if (doLogging && loggingActive) {
            console.log("In " + this._grpName + " closed group " + this._poss 
                + " with " + this._allows.toListString() + " would clean " + level + " digits.");
        }
        return level;
    }

    apply(board: Board) {
        let doLogging = false;
        let fcGroup = board.fieldContentsOf(this._poss);
        let possGroupSet = new Set(fcGroup.map((fc) => fc.pos));

        if (doLogging && loggingActive) {
            console.log("Filter in " + this._grpName + " of the joined group " + this._poss + " is " + this._allows.toListString());
        }

        let group = Position.namedGroup(this._grpName);
        let possClean = board.fieldContentsOf(group)
                        .filter((fc) => fc.isEmpty())
                        .map((fc) => fc.pos)
                        .filter((pos) => !possGroupSet.has(pos))

        let cleanAllow = this._allows.not()
        let level = 0;
        for (let pos of possClean) {
            let fcToClean = board.fieldContentOf(pos);
            let cleanedAllow = fcToClean.allowSet.and(cleanAllow);
            level += fcToClean.allowSet.length - cleanedAllow.length;
            fcToClean.setAllowSet(cleanedAllow);
        }
        if (doLogging && loggingActive) {
            console.log("In " + this._grpName + " closed group " + this._poss 
                + " with " + this._allows.toListString() + " cleaned " + level + " digits.");
        }
    }    

    static of(groupName: string, groupFields: FieldContent[], allows: CipherSet): ClosedGroup {
        let cg = new ClosedGroup(groupName);
        for (let fc of groupFields) {
            cg._poss.push(fc.pos);
        }
        cg._allows = allows;
        return cg;
    }
}

export class ClosedGroups {
    _groups: ClosedGroup[];

    constructor() {
        this._groups = [];
    }

    get groups(): ClosedGroup[] {
        return this._groups;
    }

    add(closedGroup: ClosedGroup) {
        this._groups.push(closedGroup);
    }

    get length(): number {
        return this._groups.length;
    }

    apply(board: Board) {
        this._groups.forEach((cg) => cg.apply(board));
    }

    getGroup(ofs: number): ClosedGroup {
        return this._groups[ofs];
    }
}