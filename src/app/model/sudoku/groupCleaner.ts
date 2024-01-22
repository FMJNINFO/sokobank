import { Board } from "./board";
import { CipherSet } from "./cipherset";
import { FieldContent } from "./fieldContent";
import { Position } from "./position";
import { SubArray } from "./subarray";

export class GroupCleaner {
    private board: Board;
    private checks: number;
    private _groups: Position[][] = []
    private _joinedAllows: CipherSet[] = []

    constructor(board: Board) {
        this.board = board;
        this.checks = 0;
    }

    get groups(): Position[][] {
        return this._groups;
    }

    get joinedAllows(): CipherSet[] {
        return this._joinedAllows;
    }

    countSubsets(): number {
        var fieldContents: FieldContent[] = [];
        for (let grp of Position.allGrps()) {
            fieldContents = this.board.fieldContents(grp)
            .filter((fc) => fc.isEmpty() );
            console.log("FieldContents: " + fieldContents.length);
            for (let depth=2; depth < fieldContents.length; depth++) {
                this.findSizedSubsets(fieldContents, depth);
            }
        }
        return this.checks;
    }

    findSizedSubsets(fieldContents: FieldContent[], depth: number) {
        if (fieldContents.length < depth+1) {
            return;
        }
        let workFieldContents: FieldContent[] = []
        for (let fc of fieldContents) {
            workFieldContents.push(fc);
        }
        this.findSubset(workFieldContents, depth)
    }

    findSubset(fieldContents: FieldContent[], depth: number) {
        let subarrayIter = new SubArray(fieldContents.length, depth);
        var idxSubset: number[] | undefined;
        var subset: FieldContent[] = [];
        let joinedAllowSet: CipherSet = new CipherSet()

        while ((idxSubset = subarrayIter.next()) != undefined) {
            for (let iIdx=0; iIdx<depth; iIdx++) {
                subset.push(fieldContents[idxSubset[iIdx]]);
            }

            this.checks += 1;
            for (let fc of subset) {
                joinedAllowSet = joinedAllowSet.or(fc.allowSet);
                if (joinedAllowSet.length > depth) {
                    return;
                }
            }
            this._groups.push(subset.map((fc) => fc.pos))
            this._joinedAllows.push(joinedAllowSet);
        }
        return;
    }
}

