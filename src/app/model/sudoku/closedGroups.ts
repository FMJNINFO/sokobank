import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { Position } from "./position";

export class ClosedGroup {
    _poss: Position[];
    _grpName: string;
    _allows: CipherSet;

    constructor(groupName: string) {
        this._grpName = groupName;
        this._poss = [];
        this._allows = new CipherSet();
    }

    add(fc: FieldContent): void {
        this._poss.push(fc.pos);
        this._allows = this._allows.or(fc.allowSet);
    }
    
    get baseGroupName(): string {
        return this._grpName;
    }

    get length(): number {
        return this._poss.length;
    }

    get isValid(): boolean {
        return (this._allows.length <= this._poss.length) && this.length > 0;
    }

    toString(): string {
        if (this._poss.length == 0) {
            return "Closed group " + this._grpName + " is empty.";
        }
        return "Closed group for " + this._grpName + ": " + this._allows.toListString() + " -> " + this._poss;
    }

    cleaningLevel(board: Board) {
        var doLogging = false;
        var fcGroup = board.fieldContents(this._poss);
        var possGroupSet = new Set(fcGroup.map((fc) => fc.pos));

        let group = Position.namedGroup(this._grpName);
        let possClean = board.fieldContents(group)
                        .filter((fc) => fc.isEmpty())
                        .map((fc) => fc.pos)
                        .filter((pos) => !possGroupSet.has(pos))

        let cleanAllow = this._allows.not()
        let level = 0;
        for (let pos of possClean) {
            let fcToClean = board.fieldContent(pos);
            let cleanedAllow = fcToClean.allowSet.and(cleanAllow);
            level += fcToClean.allowSet.length - cleanedAllow.length;
        }
        if (doLogging) {
            console.log("In " + this._grpName + " closed group " + this._poss 
                + " with " + this._allows.toListString() + " would clean " + level + " digits.");
        }
        return level;
    }

    clean(board: Board) {
        var doLogging = false;
        var fcGroup = board.fieldContents(this._poss);
        var possGroupSet = new Set(fcGroup.map((fc) => fc.pos));

        if (doLogging) {
            console.log("Filter in " + this._grpName + " of the joined group " + this._poss + " is " + this._allows.toListString());
        }

        let group = Position.namedGroup(this._grpName);
        let possClean = board.fieldContents(group)
                        .filter((fc) => fc.isEmpty())
                        .map((fc) => fc.pos)
                        .filter((pos) => !possGroupSet.has(pos))

        let cleanAllow = this._allows.not()
        let level = 0;
        for (let pos of possClean) {
            let fcToClean = board.fieldContent(pos);
            let cleanedAllow = fcToClean.allowSet.and(cleanAllow);
            level += fcToClean.allowSet.length - cleanedAllow.length;
            fcToClean.setAllowSet(cleanedAllow);
        }
        if (doLogging) {
            console.log("In " + this._grpName + " closed group " + this._poss 
                + " with " + this._allows.toListString() + " cleaned " + level + " digits.");
        }
    }    

    asSet(): Set<Position> {
        let groupSet = new Set<Position>();
        for (let pos of this._poss) {
            groupSet.add(pos);
        }
        return groupSet;
    }

    equals(other: any): boolean {
        if (other instanceof ClosedGroup) {
            let otherGroup: ClosedGroup = other;
            if (otherGroup._poss.length == this._poss.length) {
                // OK, because same order by construction
                for (let i=0; i<this._poss.length; i++) {                        
                    if (!otherGroup._poss[i].equals(this._poss[i])) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    in(butSet: Set<ClosedGroup>): boolean {
        for (let butGroup of butSet) {
            if (butGroup.equals(this)) {
                return true;
            }
        }
        return false;
    }
}

export class ClosedGroups {
    _groups: ClosedGroup[];

    constructor() {
        this._groups = [];
    }

    group(ofs: number=0): ClosedGroup {
        if (this._groups.length > ofs) {
            return this._groups[ofs];
        }
        return new ClosedGroup("dummy");
    }

    sortedBySize(): ClosedGroup[] {
        return this._groups.sort((g1, g2) => g1.length - g2.length)
    }

    sortedByName(): ClosedGroup[] {
        return this._groups.sort((g1, g2) => {
            if (g1.baseGroupName > g2.baseGroupName) {
                return 1;
            }
            if (g1.baseGroupName < g2.baseGroupName) {
                return -1;
            }
            return g1.length - g2.length;
        })
    }

    _add(closedGroup: ClosedGroup) {
        this._groups.push(closedGroup);
    }

    checkAndAdd(baseGroupName: string, fieldContents: FieldContent[]) {
        var closedGroup = new ClosedGroup(baseGroupName);
        fieldContents.forEach((fc) => closedGroup.add(fc));
        if (closedGroup.isValid) {
            this._add(closedGroup)
        }
    }

    get length(): number {
        return this._groups.length;
    }
}