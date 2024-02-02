import { Board } from "./board";
import { ClosedGroups } from "./closedGroups";
import { FieldContent } from "./fieldContent";
import { Position } from "./position";
import { SubArray } from "./subarray";

export class GroupCleaner {
    private _closedGroups: ClosedGroups;

    constructor() {
        this._closedGroups = new ClosedGroups();
    }

    findClosedGroups(board: Board, findAll: boolean=true): ClosedGroups {
        var fieldContents: FieldContent[] = [];
        this._closedGroups = new ClosedGroups();

        for (let [sGrp, grp] of Position.namedGrps()) {
            fieldContents = board.fieldContents(grp)
            .filter((fc) => fc.isEmpty() );
            for (let depth=2; depth < fieldContents.length; depth++) {
                this._findSubset(sGrp, fieldContents, depth, findAll);
                if (findAll) {
                    continue;
                }
                if (!findAll && this._closedGroups.length > 0) {
                    break;
                }
            }
        }
        return this._closedGroups;
    }

    _findSizedSubsets(sGrp: string, fieldContents: FieldContent[], depth: number, findAll: boolean) {
        if (depth >= fieldContents.length) {
            return;
        }
        this._findSubset(sGrp, fieldContents, depth, findAll)
    }


    _findSubset(sGrp: string, fieldContents: FieldContent[], depth: number, findAll: boolean) {
        let subsetIter = new SubArray(fieldContents.length, depth);
        var subset: number[] | undefined;

        while ((subset = subsetIter.next()) != undefined) {
            if (subset == undefined) {
                return;
            }
            this._closedGroups.checkAndAdd( sGrp, subset.map((inx) => fieldContents[inx]) );
            if (findAll) {
                continue;
            }
            if (this._closedGroups.length > 0) {
                return;
            }
        }
        return;
    }
}

