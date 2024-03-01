import { Board } from "./board";
import { ClosedGroup, ClosedGroups } from "./solution/closedGroups";
import { Cause } from "./fieldContent";
import { Move } from "./move";
import { Position } from "./position";
import { LonelyCipherFinder } from "./solution/lonelyCipherFinder";
import { UniqueCipherFinder } from "./solution/uniqueCipherFinder";
import { CipherByTrialFinder } from "./solution/cipherByTrialFinder";
import { ClosedGroupFinder } from "./solution/closedGroupFinder";

interface SolverMemory {
    lastUser: string;
    lonelyCiphers: Move[];
    lonelyCipherOfs: number;
    uniqueCiphers: Move[];
    uniqueCipherOfs: number;
    closedGroups: Object[];
}    

export class Solver {
    memory: SolverMemory = {
        lastUser: "",
        lonelyCiphers: [],
        lonelyCipherOfs: -1,
        uniqueCiphers: [],
        uniqueCipherOfs: -1,
        closedGroups: []
    };

    uniqueCipherFinder: UniqueCipherFinder;
    lonelyCipherFinder: LonelyCipherFinder;
    cipherByTrialFinder: CipherByTrialFinder;
    closedGroupFinder: ClosedGroupFinder;

    constructor() {
        this.adjustMemory();
        this.uniqueCipherFinder = new UniqueCipherFinder(this);
        this.lonelyCipherFinder = new LonelyCipherFinder(this);
        this.cipherByTrialFinder = new CipherByTrialFinder(this);
        this.closedGroupFinder = new ClosedGroupFinder();
    }

    adjustMemory(userName: string="") {
        if (this.memory.lastUser != userName) {
            this.memory.lastUser = userName;
            this.memory.lonelyCiphers = [];
            this.memory.lonelyCipherOfs = -1;
            this.memory.uniqueCiphers = [];
            this.memory.uniqueCipherOfs = -1;
            this.memory.closedGroups = [];    
        }
    }

    findAllLonelyCiphers(board: Board): Move[] {
        return this.lonelyCipherFinder.findLonelyCiphers(board, true);
    }

    #findOneLonelyCipher(board: Board): Move {
        var moves = this.lonelyCipherFinder.findLonelyCiphers(board, false);

        if (moves.length < 1) {
            return new Move(Position.NoPosition);     // empty dummy
        }
        return moves[0];
    }

    findAllUniqueCiphers(board: Board): Move[] {
        return this.uniqueCipherFinder.findUniqueCiphers(board, true);
    }

    #findOneUniqueCipher(board: Board): Move {
        var moves = this.uniqueCipherFinder.findUniqueCiphers(board, false);

        if (moves.length < 1) {
            return new Move(Position.NoPosition);     // empty dummy
        }
        return moves[0];
    }

    findAllClosedGroups(board: Board): ClosedGroups {
        this.closedGroupFinder.findAll(board);
        return this.closedGroupFinder.findAll(board);
    }

    findBestClosedGroup(board: Board): ClosedGroup | undefined {
        return this.closedGroupFinder.findBestClosedGroup(board);
    }

    #findOneClosedGroup(board: Board, but: Set<ClosedGroup>=new Set()) {
        var closedGroups = this.closedGroupFinder.findAll(board);        

        for (let i=0; i<closedGroups.length; i++) {
            let closedGroup = closedGroups.group(i);
            if (!closedGroup.in(but)) {
                this.closedGroupFinder.findAll(board);
                return closedGroup;
            }
        }
        return closedGroups.group(closedGroups.length); // dummy
    }

    findAllResolvingMoves(board: Board): Move[] {
        return this.cipherByTrialFinder.findAllResolvingMoves(board);
    }

    solve(board: Board): boolean {
        var doLogging = false;

        var retry: boolean;
        var move: Move;
        var knownGroups = new Set<ClosedGroup>();

        do {
            retry = false;
            move = this.#findOneLonelyCipher(board);
            if (move.hasDigit()) {
                retry = true;
                board.add(move, Cause.LONELY_CIPHER);
                knownGroups.clear();
                continue;
            }
            move = this.#findOneUniqueCipher(board);
            if (move.hasDigit()) {
                retry = true;
                board.add(move, Cause.UNIQUE_CIPHER);
                knownGroups.clear();
                continue;
            }

            let closedGroup = this.#findOneClosedGroup(board, knownGroups);
            if (closedGroup.isValid) {
                closedGroup.clean(board);
                knownGroups.add(closedGroup);
                retry = true
            }
        } while (retry);

        if (board.isFull()) {
            if (doLogging) {
                for (let fc of board.allFieldContents()) {
                    console.log(fc.getMove().toString());
                }
            }
            return true;
        }

        let closedGroups = this.findAllClosedGroups(board);

        if (doLogging) {
            if (closedGroups.length == 0) {
                console.log("Looking for a closed group, but found none." );
            } else {
                console.log("Looking for a closed group and found one." );
            }
        }
        return false;
    }
}
