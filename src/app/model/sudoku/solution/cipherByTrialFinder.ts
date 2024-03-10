import { Board, BoardError } from "../board";
import { FieldContent, Cause } from "../fieldContent";
import { Move } from "../move";
import { SolutionState, SolveStep, Solver } from "../solver";


export class CipherByTrialFinder {
    static cause = Cause.TRIAL_CIPHER;
    _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
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
            ss.setLoneyCipherMoves(this._solver.lonelyCipherFinder.findAll(state.board));
            ss.setUniqueCipherMoves(this._solver.uniqueCipherFinder.findAll(state.board));
            ss.setClosedGroups(this._solver.closedGroupFinder.findAll(state.board));

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

        let fcCandidates = this.getCandidates(startState.board);   // welche Felder werden geprueft
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

    findTrialMoves(state: SolutionState): SolutionState {
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

    findAllTrialMoves(board: Board): Move[] {
        let trialMoves: Move[] = [];
        let resultState = this.findTrialMoves(new SolutionState(board));

        resultState.steps.forEach((step) => step.addTrialMove(trialMoves));

        return trialMoves;
    }

    #checkOneMove(testBoard: Board, move: Move): [boolean, number] {
        let board = testBoard.copy();
        let doLogging = true;

        board.add(move, Cause.TRIAL_CIPHER);
        let emptyFieldCount = board.emptyFieldCount();

        try {
            if (this._solver.solveLogical(board)) {
                //  we found a solution
                let win = (emptyFieldCount-board.emptyFieldCount());
                if (doLogging) {
                    console.log("Move " + move.toString() + " would clean " + win + " digits.");
                    console.log("==> It will yield a solution.");
                }
                return [true, win];
            }
        } catch(error) {
            if (error instanceof BoardError) {
                if (doLogging) {
                    console.log("Move " + move.toString() + " yields to an ERROR.");
                }
                return [false, 0];
            }
        }
        //  No solution, but the digit leads further to a solution
        return [false, emptyFieldCount-board.emptyFieldCount()];
    }

    #trySolvingOneFieldContent(board: Board, fc: FieldContent): [boolean, Move, number] {
        //  Check how far any allowed cipher of the given FieldContent
        //  gets to a board solution or if it leads to an error
        let doLogging = true;
        let bestMove = new Move(fc.pos);    // dummy
        let bestWin = 0;
        let isSolved: boolean;
        let win: number;

        for (let digit of fc.allowSet.entries) {
            let testMove = new Move(fc.pos, digit);

            [isSolved, win] = this.#checkOneMove(board, testMove);

            if (win > bestWin) {
                bestWin = win;
                bestMove = testMove;
            }
            if (doLogging) {
                console.log("Move " + testMove.toString() + " would clean " + win + " digits.");
            }
        }
        return [false, bestMove, bestWin];
    }

    getCandidates(board: Board): FieldContent[] {
        let fcCandidates: FieldContent[] = [];
        let count = 9;

        for (let fc of board.emptyFieldContents()) {
            if (fc.allowSet.length < count) {
                fcCandidates = []
                count = fc.allowSet.length;
                fcCandidates.push(fc);
            } else {
                if (fc.allowSet.length == count) {
                    fcCandidates.push(fc);
                }
            }
        }
        return fcCandidates;
    }

    #logCandidates(fcCandidates: FieldContent[]) {
        console.log();
        console.log("Minimal candidate size is " + fcCandidates[0].allowSet.length);
        console.log("Found " + fcCandidates.length + " candidates of this size:");
        for (let fc of fcCandidates) {
            console.log("   " + fc.toString())
        }
    }

    #checkOneCandidate(board: Board, fc: FieldContent):[boolean, Move | undefined] {
        let doLogging = true;
        let resolutionMove: Move;
        let isSolving: boolean;
        let digitWin: number;

        [isSolving, resolutionMove, digitWin] = this.#trySolvingOneFieldContent(board, fc);
        if (isSolving) {
            if (doLogging) {
                console.log("Found resolving move at " + resolutionMove.toString())
            }
            return [true, resolutionMove];
        } else {
            if (resolutionMove.hasDigit()) {
                if (doLogging) {
                    console.log("Found move at " + resolutionMove.toString() + " that cleans " + digitWin + " digits.");
                }
                return [false, resolutionMove];
            } else {
                if (doLogging) {
                    console.log("Found no resolving move at " + resolutionMove.pos.toString());
                }
            }
        }
        return [false, undefined];
    }

    findAllResolvingMoves(board: Board): Move[] {
        let isSolving: boolean;
        let doLogging = true;
        let solutionMoves: Move[] = [];

        let fcCandidates = this.getCandidates(board);

        if (doLogging) {
            this.#logCandidates(fcCandidates);
        }

        if (fcCandidates[0].allowSet.length == 2) {
            let possibleSolutionMoves: Move[] = [];
            let resultMove: Move | undefined;

            for (let fc of fcCandidates) {
                [isSolving, resultMove] = this.#checkOneCandidate(board, fc);
                if (resultMove != undefined) {
                    if (isSolving) {
                        solutionMoves.push(resultMove);
                    } else {
                        possibleSolutionMoves.push(resultMove);
                    }
                }
            }
            if (solutionMoves.length == 0) {
                //  No solution found; so we must dig deeper with possible solution moves
                if (doLogging) {
                    console.log("Found " + possibleSolutionMoves.length + " possible solutions moves.");
                }
                for (let checkMove of possibleSolutionMoves) {
                    let testBoard = board.copy();
                    testBoard.add(checkMove, Cause.TRIAL_CIPHER);

                    try {
                        this._solver.solveLogical(testBoard);
                        if (this.findAllResolvingMoves(testBoard).length > 0) {
                            solutionMoves.push(checkMove);
                        }
                    } catch(error) {
                        if (error instanceof BoardError) {
                            if (doLogging) {
                                console.log("Move " + checkMove.toString() + " yields to an ERROR.");
                            }
                        }
                    }
                }
            }
        } else {
            if (doLogging) {
                console.log("Minimal count of all empty fields is " + fcCandidates[0].allowSet.length)
            }
        }
        return solutionMoves;
    }
}