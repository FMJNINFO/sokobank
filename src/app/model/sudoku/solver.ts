import { Board, BoardError } from "./board";
import { ClosedGroup, ClosedGroups } from "./solution/closedGroups";
import { Move } from "./move";
import { LonelyCipherFinder } from "./solution/lonelyCipherFinder";
import { UniqueCipherFinder } from "./solution/uniqueCipherFinder";
import { CipherByTrialFinder } from "./solution/cipherByTrialFinder";
import { ClosedGroupFinder } from "./solution/closedGroupFinder";
import { logBoard } from "./logger";

export class SolveStep {
    _trialMove: Move | undefined;
    _lonelyCipherMoves: Move[];
    _uniqueCipherMoves: Move[];
    _closedGroups: ClosedGroups | undefined;

    constructor(trialMove: Move | undefined = undefined) {
        this._trialMove = trialMove;
        this._lonelyCipherMoves = [];
        this._uniqueCipherMoves = [];
        this._closedGroups = undefined;
    }

    get trialMove(): Move | undefined {
        return this._trialMove;
    }

    get lonelyCipherMoves(): Move[] {
        return this._lonelyCipherMoves;
    }

    get uniqueCipherMoves(): Move[] {
        return this._uniqueCipherMoves;
    }

    setLoneyCipherMoves(moves: Move[]) {
        this._lonelyCipherMoves = moves;
    }

    setUniqueCipherMoves(moves: Move[]) {
        this._uniqueCipherMoves = moves;
    }

    addTrialMove(moves: Move[]) {
        if (this._trialMove != undefined) {
            moves.push(this._trialMove);
        }
    }

    setClosedGroups(closedGroups: ClosedGroups) {
        this._closedGroups = closedGroups;
    }

    isEmpty(): boolean {
        if (this._trialMove !== undefined) {
            return false;
        }
        if (this._lonelyCipherMoves.length > 0) {
            return false;
        }
        if (this._uniqueCipherMoves.length > 0) {
            return false;
        }
        return true;
    }

    hasContent(): boolean {
        if (this._trialMove !== undefined) {
            return true;
        }
        if (this._lonelyCipherMoves.length > 0) {
            return true;
        }
        if (this._uniqueCipherMoves.length > 0) {
            return true;
        }
        return false;
    }

    apply(board: Board): boolean {
        if (board.hasErrors())  return false;

        try {
            if (this._trialMove !== undefined) {
                board.add(this._trialMove, CipherByTrialFinder.cause);
            }
            if (this._lonelyCipherMoves.length > 0) {
                this._lonelyCipherMoves.forEach((move) => board.add(move, LonelyCipherFinder.cause));
            }
            if (this._uniqueCipherMoves.length > 0) {
                this._uniqueCipherMoves.forEach((move) => board.add(move, UniqueCipherFinder.cause));
            }
            if ((this._closedGroups !== undefined) && (this._closedGroups?.length > 0)) {
                this._closedGroups.apply(board);
            }
        } catch(error) {
            if (error instanceof BoardError) {
                return false;
            }
        }            
        return true;
    }
}    

export class SolutionState {
    _errorFree: boolean;
    _steps: SolveStep[];
    _board: Board;
    _emptyFieldCount: number;
    
    constructor(board: Board, steps: SolveStep[] = []) {
        this._steps = steps;
        this._board = board.copy();
        this._errorFree = !board.hasErrors();
        this._emptyFieldCount = board.emptyFieldCount();
    }

    addStep(step: SolveStep) {
        if (this._errorFree) {
            this._errorFree = step.apply(this._board);
            this._emptyFieldCount = this._board.emptyFieldCount();
            this._steps.push(step);
        }
    }

    get board(): Board {
        return this._board;
    }

    isComplete(): boolean {
        if (this.hasErrors()) {
            return false;
        }
        return this._emptyFieldCount == 0;
    }

    isIncomplete(): boolean {
        return !this.isComplete();
    }

    hasSteps(): boolean {
        return this._steps.length > 0;
    }

    hasErrors(): boolean {
        return !this._errorFree;
    }

    isOk(): boolean {
        return this._errorFree;
    }

    print(): void {
        logBoard(this._board);
    }

    basedCopy(): SolutionState {
        //  erzeugt eine basierte Kopie von aktuellen Status, d.h. aktuelles Board, aber keine steps
        let state = new SolutionState(this._board);
        return state;
    }

    copy(): SolutionState {
        //  erzeugt eine FLACHE Kopie von diesem Status, d.h. die Steps sind dieselben
        let state = new SolutionState(this._board);
        state._steps = this._steps;
        return state;
    }

    isBetterThan(state: SolutionState): boolean {
        return this._emptyFieldCount < state._emptyFieldCount;
    }

    get steps(): SolveStep[] {
        return this._steps;
    }

    get emptyFieldCount(): number {
        return this._emptyFieldCount;
    }
}

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
        this.updateMemory();
        this.uniqueCipherFinder = new UniqueCipherFinder(this);
        this.lonelyCipherFinder = new LonelyCipherFinder(this);
        this.cipherByTrialFinder = new CipherByTrialFinder(this);
        this.closedGroupFinder = new ClosedGroupFinder();
    }

    updateMemory(userName: string="") {
        if ((this.memory.lastUser != userName) || (userName === "")) {
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

    findAllUniqueCiphers(board: Board): Move[] {
        return this.uniqueCipherFinder.findUniqueCiphers(board, true);
    }

    findAllClosedGroups(board: Board): ClosedGroups {
        return this.closedGroupFinder.findAll(board);
    }

    findBestClosedGroup(board: Board): ClosedGroup | undefined {
        return this.closedGroupFinder.findBestClosedGroup(board);
    }

    findAllResolvingMoves(board: Board): Move[] {
        return this.cipherByTrialFinder.findAllTrialMoves(board);
    }

    solveComplete(board: Board) {
        //  Wir haben ein board und suchen eine Loesung, d.h. eine Liste von SolveSteps
        let resultState = this.cipherByTrialFinder.findTrialMoves(new SolutionState(board));
        console.log("Freie Felder: " + resultState.emptyFieldCount);

        if (resultState.isComplete()) {
            console.log("Solution was successful");
            for (let step of resultState.steps) {
                if (step._trialMove != undefined) {
                    console.log("Trial move: " + step._trialMove.toString());
                }
            }
        } else {
            console.log("Solution was NOT successful");
        }
        for (let ss of resultState.steps) {
            ss.apply(board);
        }
        logBoard(board);
    }

    solveLogical(board: Board): boolean {
        let doLogging = false;
        let retry: boolean;

        do {
            retry = true;

            if (board.isFull()) {
                break;
            }

            try {
                if (this.lonelyCipherFinder.solveAll(board)) {
                    this.closedGroupFinder.solveAll(board);
                    continue;
                }

                if (this.uniqueCipherFinder.solveAll(board)) {
                    this.closedGroupFinder.solveAll(board);
                    continue;
                }
            } catch(error) {
                if (error instanceof BoardError) {
                    return false;
                }
            }
            retry = false;
        } while (retry);

        if (board.isFull()) {
            if (doLogging) {
                for (let fc of board.fieldContents()) {
                    console.log(fc.getMove().toString());
                }
            }
            return true;
        }
        return false;
    }
}
