import { Board, BoardError } from "./board";
import { ClosedGroup, ClosedGroups } from "./solution/closedGroups";
import { Move } from "./move";
import { LonelyCipherFinder } from "./solution/lonelyCipherFinder";
import { UniqueCipherFinder } from "./solution/uniqueCipherFinder";
import { CipherByTrialFinder } from "./solution/cipherByTrialFinder";
import { ClosedGroupFinder } from "./solution/closedGroupFinder";
import { logBoard } from "./logger";
import { SolverMemory } from "./solverMemory";
import { Cause } from "./cause";
import { Step } from "./step";

export class SolveSet {
    _steps: Step[];
    _trialMove: Move | undefined;
    _lonelyCipherMoves: Move[];
    _uniqueCipherMoves: Move[];
    _closedGroups: ClosedGroups | undefined;

    constructor(trialMove: Move | undefined = undefined) {
        this._trialMove = trialMove;
        this._lonelyCipherMoves = [];
        this._uniqueCipherMoves = [];
        this._steps = [];
        this._closedGroups = undefined;
    }

    get steps(): Step[] {
        return this._steps;
    }

    addSteps(steps: Step[]) {
        this._steps = this._steps.concat(steps);
    }

    addStep(step: Step) {
        this._steps.push(step);
    }

    setClosedGroups(closedGroups: ClosedGroups) {
        this._closedGroups = closedGroups;
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
                board.addStep(new Step(CipherByTrialFinder.cause, this._trialMove.pos, this._trialMove.digit ));
            }
            if (this._lonelyCipherMoves.length > 0) {
                this._lonelyCipherMoves.forEach((move) => board.addStep(new Step(LonelyCipherFinder.cause, move.pos, move.digit)));
            }
            if (this._uniqueCipherMoves.length > 0) {
                this._uniqueCipherMoves.forEach((move) => board.addStep(new Step(UniqueCipherFinder.cause, move.pos, move.digit )));
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
    _sets: SolveSet[];
    _board: Board;
    _emptyFieldCount: number;
    _steps: Step[];
    
    constructor(board: Board, sets: SolveSet[] = []) {
        this._sets = sets;
        this._steps = sets.reduce((steps: Step[], set) => steps.concat(set.steps), []);
        this._board = board.copy();
        this._errorFree = !board.hasErrors();
        this._emptyFieldCount = board.emptyFieldCount();
    }

    addSet(set: SolveSet) {
        if (this._errorFree) {
            this._errorFree = set.apply(this._board);
            this._emptyFieldCount = this._board.emptyFieldCount();
            this._sets.push(set);
            this._steps = set.steps.concat(this._steps);
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

    hasSets(): boolean {
        return this._sets.length > 0;
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
        state._sets = this._sets;
        state._steps = this._steps;
        return state;
    }

    isBetterThan(state: SolutionState): boolean {
        return this._emptyFieldCount < state._emptyFieldCount;
    }

    get sets(): SolveSet[] {
        return this._sets;
    }

    get emptyFieldCount(): number {
        return this._emptyFieldCount;
    }
}

export class Solver {
    uniqueCipherFinder: UniqueCipherFinder;
    lonelyCipherFinder: LonelyCipherFinder;
    cipherByTrialFinder: CipherByTrialFinder;
    closedGroupFinder: ClosedGroupFinder;
    memory: SolverMemory;
    steps: Step[];

    constructor(memory: SolverMemory) {
        this.memory = memory;
        this.uniqueCipherFinder = new UniqueCipherFinder(this);
        this.lonelyCipherFinder = new LonelyCipherFinder(this);
        this.cipherByTrialFinder = new CipherByTrialFinder(this);
        this.closedGroupFinder = new ClosedGroupFinder();
        this.steps = [];
    }

    findAllCheats(board: Board): void {
        let doLogging = true;

        this.memory.reset();

        let steps = this.#findAllLonelyCiphers(board);
        this.memory.saveLonelyCiphers(steps);
        if (doLogging) {
            for (let step of steps) {
                console.log("Lonely cipher: " + step.toString())
            }
            console.log("-- Find Lonely Cipher done.")
        }    

        steps = this.#findAllUniqueCiphers(board);
        this.memory.saveUniqueCiphers(steps);

        if (doLogging) {
            for (let step of steps) {
                console.log("Found unique cipher: " + step.toString());
            }
            console.log("-- Find Unique Cipher done.")
        }

        let groups = this.#findAllClosedGroups(board);
        this.memory.saveClosedGroups(groups);

        if (doLogging) {
            for (let group of groups.groups) {
                console.log("Found closed groups: " + groups.toString());
            }
            console.log("-- Find Closed Groups done.")
        }
    }

    #findAllLonelyCiphers(board: Board): Step[] {
        return this.lonelyCipherFinder.getAllSteps(board);
    }

    #findAllUniqueCiphers(board: Board): Step[] {
        return this.uniqueCipherFinder.findUniqueCiphers(board);
    }

    #findAllClosedGroups(board: Board): ClosedGroups {
        return this.closedGroupFinder.getAll(board);
    }

    findAllResolvingSteps(board: Board): [boolean, Step[]] {
        let testBoard = board.copy();
        let steps = this.findLogicalSteps(testBoard);
        let isSolved = true;
        if (!testBoard.isFull()) {
            let trialSteps: Step[] = [];
            [isSolved, trialSteps] = this.cipherByTrialFinder.findAllResolvingSteps(testBoard);
            steps.push(...trialSteps);
        }
        return [isSolved, steps];
    }

    getResolvedBoard(board: Board, reversed: boolean=false): [boolean, Board] {
        let testBoard = board.copy();
        let steps : Step[] = [];
        try {
            steps = this.findLogicalSteps(testBoard);
        } catch(error) {
            return [false, testBoard];
        }

        let isSolved = true;
        let trialSteps: Step[] = []
        if (!testBoard.isFull()) {
            [isSolved, trialSteps] = this.cipherByTrialFinder.findAllResolvingSteps(testBoard, reversed);            
            steps.push(...trialSteps);
            for (let step of steps) {
                testBoard.addStep(step);
            }
        }
        return [isSolved, testBoard];
    }

    findLogicalSteps(testBoard: Board): Step[] {
        //  the same as this.logicalSteps(board)
        let doLogging = false;
        let retry: boolean;
        let steps: Step[] = [];
        let logicalSteps: Step[] = [];
        let count: number;
        let groups: ClosedGroups;

        do {
            retry = true;

            if (testBoard.isFull()) {
                return logicalSteps;
            }

            steps = this.lonelyCipherFinder.getAllSteps(testBoard);
            logicalSteps.push(...steps);
            count = steps.length;
            steps.forEach((step) => testBoard.addStep(step));
            let solvedSomething= count > 0;        
            this.memory.clearLonelyCiphers();
            if (solvedSomething) {
                solvedSomething = false;
                groups = this.closedGroupFinder.getAll(testBoard);                    
                for (let group of groups.groups) {
                    if (group.cleaningLevel(testBoard) > 0) {
                        group.apply(testBoard);
                        solvedSomething = true;
                    }
                }
                this.memory.clearClosedGroups();
                continue;
            }

            steps = this.uniqueCipherFinder.getAllSteps(testBoard);
            logicalSteps.push(...steps);
            count = steps.length;
            steps.forEach((step) => testBoard.addStep(step));
            solvedSomething= count > 0;        
            this.memory.clearUniqueCiphers();
            if (solvedSomething) {
                solvedSomething = false;
                groups = this.closedGroupFinder.getAll(testBoard);                    
                for (let group of groups.groups) {
                    if (group.cleaningLevel(testBoard) > 0) {
                        group.apply(testBoard);
                        solvedSomething = true;
                    }
                }
                this.memory.clearClosedGroups();
                continue;
            }
            retry = false;
        } while (retry);

        return logicalSteps;
    }
}
