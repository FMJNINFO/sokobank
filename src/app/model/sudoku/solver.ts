import { Board, BoardError } from "./board";
import { ClosedGroup, ClosedGroups } from "./solution/closedGroups";
import { FieldContent } from "./fieldContent";
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

    setLoneyCipherMoves(moves: Move[]) {
        this._lonelyCipherMoves = moves;
    }

    setUniqueCipherMoves(moves: Move[]) {
        this._uniqueCipherMoves = moves;
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
        return this.cipherByTrialFinder.findAllResolvingMoves(board);
    }

    solve(board: Board): boolean {
        let doLogging = false;
        if (this.solveOneLevel(board)) {
            return true;
        }
        this.cipherByTrialFinder.solveAll(board);
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

    #findSolveStep(state: SolutionState, trialMove: Move | undefined = undefined): SolutionState {
        //  das Board - falls vorhanden - mit dem trialMove fuellen und dann
        //  mit der Logik weitermachen, bis nichts mehr dazukommt oder ein Fehler auftritt
        //  Das Board sollte ein Arbeitsboard (evtl. also eine Kopie) sein, da wir es vollschreiben
        let ss: SolveStep;

        do {
            ss = new SolveStep(trialMove);
            if (trialMove !== undefined) {
                trialMove = undefined;
            }
            ss.setLoneyCipherMoves(this.lonelyCipherFinder.findAll(state.board));
            ss.setUniqueCipherMoves(this.uniqueCipherFinder.findAll(state.board));
            ss.setClosedGroups(this.closedGroupFinder.findAll(state.board));

            if (ss.hasContent()) {
                //   es wurden via Logik noch etwas gefunden
                state.addStep(ss);  //  gefundene Steps merken
                if (state.hasErrors()) return state;   //  bei Inkonsistenzen(Fehler) raus hier
            }
            //  solange wiederholen, bis die Logik ausgereizt wurde
        } while (ss.hasContent());

        //  Es ist kein Fehler aufgetreten und trialMove + Logik haben uns fehlerfrei bis hier gebracht
        console.log("=== findSolveStep result: ===")
        state.print();

        return state;    //  der uebergebene trialMove hat allein noch kein Problem verursacht. Alles OK.
    }

    #dumpLog(name: string, board: Board, hasFrame: boolean) {
        if (hasFrame) {
            console.log("=============================================================");
            console.log("=   " + name);
            console.log("=============================================================");
        }
        if (board.isFull()) {
            console.log("-   Board is completely filled.");
        } else {
            console.log("-   Board is NOT completely filled (" + board.emptyFieldCount() + " unfilled).");
        }
        if (hasFrame)
            console.log("-------------------------------------------------------------");
        console.log(" ");    
    }

    #checkOneTrialField(state: SolutionState, testFieldContent: FieldContent): SolutionState {
        let loopState: SolutionState;
        let resultState = state.copy(); // Das wird (hoffentlich) verbessert

        for (let digit of testFieldContent.allowSet.entries) {
            //  alle moeglichen Ziffern des Feld-Kandidaten pruefen
            let testMove = new Move(testFieldContent.pos, digit);     // das ist der Move zum Test: Feld + Ziffer
            console.log("--> move: " + testMove);
            loopState = this.#findSolveStep(state.basedCopy(), testMove);

            //  Wir testen nicht alle Move-Kombinationen in die Tiefe, sondern bleiben auf dieser Ebene                
            //  irgendwie muss ein Zug ausgesucht werden
            //  Suchen wir auf dieser Ebene den besten - der uns am weitesten bringt - zu finden
            if (loopState.isOk()) {
                //  kein Fehler aufgetreten
                if (loopState.isBetterThan(resultState)) {
                    //  Eindeutig besser, also merken
                    resultState = loopState;
                    if (resultState.isComplete()) {
                        //  weiter kommen wir nicht! Also raus hier.
                        break;
                    }
                }
            }
        }
        return resultState;
    }

    #findOneTrialMove(state: SolutionState): SolutionState {
        //  Alles loesen, was sich via Logik ergibt
        this.#dumpLog("Easy clean", state.board, true);
        let startState = this.#findSolveStep(state);
        if (startState.isComplete()) {
            return startState;      //  Loesung schon gefunden -> den Loesungsstatus zurueckgeben
        }

        let fcCandidates = this.cipherByTrialFinder.getCandidates(startState.board);   // welche Felder werden geprueft
        let loopState = startState.basedCopy();

        this.#dumpLog("Trial find", startState.board, true);
        for (let fc of fcCandidates) {
            //  einen Feld-Kandidaten durchtesten
            console.log("==> Try at " + fc.pos.toString());
            loopState = this.#checkOneTrialField(startState, fc);

            if (loopState.isComplete()) {
                //  Board ist voll. Auch hier raus.
                break;
            }
        }
        if (loopState.hasSteps()) {
            startState = new SolutionState(loopState.board, [...startState.steps, ...loopState.steps])
            console.log("Freie Felder: " + startState.emptyFieldCount);
        }
        return loopState;
    }

    #findTrialMoves(state: SolutionState): SolutionState {
        //  Wir haben ein Board und suchen einen oder mehrere trials move in einer Reihe von SolveSteps
        //  die das Board vollstaending loesen
        let subState = state.basedCopy();

        //  Wir arbeiten mit dem uebergebenen Board, da es sowieso eine Kopie ist,
        //  denn es interessiert ja eigentlich nur die Reihe von SolveSteps
        do {
            let newState = this.#findOneTrialMove(subState);
            console.log("Freie Felder: " + newState.emptyFieldCount);

            // alle SolveSteps bis zur Loesung oder den Fehlerfall:
            if (!newState.isBetterThan(subState)) {
                return subState;
            }
            subState = new SolutionState(newState.board, [...subState.steps, ...newState.steps]);
        } while (subState.isIncomplete());   // das Ganze geht, bis das Board voll ist

        console.log("Freie Felder: " + subState.emptyFieldCount);
        return subState;
    }

    solveComplete(board: Board) {
        //  Wir haben ein board und suchen eine Loesung, d.h. eine Liste von SolveSteps
        let resultState = this.#findTrialMoves(new SolutionState(board));
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

    solveOneLevel(board: Board): boolean {
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
        }
        return false;
    }
}
