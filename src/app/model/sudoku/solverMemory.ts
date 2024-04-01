import { Cause } from "./cause";
import { Move } from "./move";
import { ClosedGroup, ClosedGroups } from "./solution/closedGroups";
import { Step } from "./step";

export class SolverMemory {
    lonelyCiphers!: Move[];
    lonelyCipherOfs!: number;
    uniqueCiphers!: Move[];
    uniqueCipherOfs!: number;
    closedGroups!: ClosedGroups;
    closedGroupsOfs!: number;

    constructor() {
        this.reset();
    }

    reset() {
        this.clearLonelyCiphers();
        this.clearUniqueCiphers();
        this.clearClosedGroups();
    }

    clearLonelyCiphers() {
        this.lonelyCiphers = [];
        this.lonelyCipherOfs = -1;
    }

    rememberLonelyCiphers(steps: Step[]) {
        this.saveLonelyCiphers(steps);
    }

    saveLonelyCiphers(steps: Step[]) {
        this.lonelyCiphers = steps.map((step) => step._move);
        this.lonelyCipherOfs = -1;
    }

    hasLonelyCipher(): boolean {
        return this.lonelyCiphers.length !== 0;
    }

    getCurrentLonelyCipher(): Step | undefined {
        if (this.hasLonelyCipher()) {
            let move = this.lonelyCiphers[this.lonelyCipherOfs];
            let step = new Step(Cause.LONELY_CIPHER, move.pos, move.digit);
            return step;
        }
        return undefined;
    }

    getNextLonelyCipher(): Step | undefined {
        if (this.hasLonelyCipher()) {
            this.lonelyCipherOfs = (this.lonelyCipherOfs+1) % this.lonelyCiphers.length;
            return this.getCurrentLonelyCipher();
        }
        return undefined;
    }

    clearUniqueCiphers() {
        this.uniqueCiphers = [];
        this.uniqueCipherOfs = -1;
    }

    rememberUniqueCiphers(steps: Step[]) {
        this.saveUniqueCiphers(steps);
    }

    saveUniqueCiphers(steps: Step[]) {
        this.uniqueCiphers = steps.map((step) => step._move);
        this.uniqueCipherOfs = -1;
    }

    hasUniqueCipher(): boolean {
        return this.uniqueCiphers.length !== 0;
    }

    getCurrentUniqueCipher(): Step | undefined {
        let move = this.uniqueCiphers[this.uniqueCipherOfs];
        let step = new Step(Cause.UNIQUE_CIPHER, move.pos, move.digit);
        return step;
    }

    getNextUniqueCipher(): Step | undefined {        
        if (this.hasUniqueCipher()) {
            this.uniqueCipherOfs = (this.uniqueCipherOfs+1) % this.uniqueCiphers.length;
            return this.getCurrentUniqueCipher();
        }
        return undefined;
    }

    clearClosedGroups() {
        this.closedGroups = new ClosedGroups();    
        this.closedGroupsOfs = -1;
    }

    rememberClosedGroups(groups: ClosedGroups) {
        this.saveClosedGroups(groups);
    }

    saveClosedGroups(groups: ClosedGroups) {
        this.closedGroups = groups;    
        this.closedGroupsOfs = -1;
    }

    hasClosedGroup(): boolean {
        return this.closedGroups.length !== 0;
    }

    getCurrentClosedGroup(): ClosedGroup {
        if (this.hasClosedGroup()) {
            return this.closedGroups.getGroup(this.closedGroupsOfs);
        }
        return ClosedGroup.NO_CLOSED_GROUP;
    }

    getNextClosedGroup(): ClosedGroup {
        if (this.hasClosedGroup()) {
            this.closedGroupsOfs = (this.closedGroupsOfs+1) % this.closedGroups.length;
            return this.getCurrentClosedGroup();
        }
        return ClosedGroup.NO_CLOSED_GROUP;
    }    
}