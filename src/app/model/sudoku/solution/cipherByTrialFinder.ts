import { Board, BoardError } from "../board";
import { Cause } from "../cause";
import { FieldContent } from "../fieldContent";
import { logBoard } from "../logger";
import { SolutionState, SolveSet, Solver } from "../solver";
import { Step } from "../step";


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

    #findSolveStep(state: SolutionState, trialStep: Step | undefined = undefined): SolutionState {
        //  das Board - falls vorhanden - mit dem trialMove fuellen und dann
        //  mit der Logik weitermachen, bis nichts mehr dazukommt oder ein Fehler auftritt
        //  Das Board sollte ein Arbeitsboard (evtl. also eine Kopie) sein, da wir es vollschreiben
        let ss: SolveSet;

        do {
            ss = new SolveSet(trialStep?._move);
            if (trialStep !== undefined) {
                ss.addStep(trialStep);
                trialStep = undefined;
            }            
            ss.addSteps(this._solver.lonelyCipherFinder.getAllSteps(state.board));

            ss.addSteps(this._solver.uniqueCipherFinder.getAllSteps(state.board));

            ss.setClosedGroups(this._solver.closedGroupFinder.getAll(state.board));

            if (ss.hasContent()) {
                //   es wurden via Logik noch etwas gefunden
                state.addSet(ss);  //  gefundene Steps merken
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
            // let testMove = new Move(testFieldContent.pos, digit);     // das ist der Move zum Test: Feld + Ziffer
            // console.log("--> move: " + testMove);
            // loopState = this.#findSolveStep(state.basedCopy(), testMove);
            let testStep = new Step(Cause.TRIAL_CIPHER, testFieldContent.pos, digit);     // das ist der Move zum Test: Feld + Ziffer
            console.log("--> step: " + testStep);
            loopState = this.#findSolveStep(state.basedCopy(), testStep);

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

    #findOneTrialStep(state: SolutionState): SolutionState {
        //  Alles loesen, was sich via Logik ergibt
        this.#dumpLog("Easy clean", state.board, true);
        let startState = this.#findSolveStep(state);
        if (startState.isComplete()) {
            return startState;      //  Loesung schon gefunden -> den Loesungsstatus zurueckgeben
        }

        let fcCandidates = this.#getCandidates(startState.board);   // welche Felder werden geprueft
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
        if (loopState.hasSets()) {
            startState = new SolutionState(loopState.board, [...startState.sets, ...loopState.sets])
            console.log("Freie Felder: " + startState.emptyFieldCount);
        }
        return loopState;
    }

    findTrialSteps(state: SolutionState): SolutionState {
        //  Wir haben ein Board und suchen einen oder mehrere trials move in einer Reihe von SolveSteps
        //  die das Board vollstaending loesen
        let subState = state.basedCopy();

        //  Wir arbeiten mit dem uebergebenen Board, da es sowieso eine Kopie ist,
        //  denn es interessiert ja eigentlich nur die Reihe von SolveSteps
        do {
            let newState = this.#findOneTrialStep(subState);
            console.log("Freie Felder: " + newState.emptyFieldCount);

            // alle SolveSteps bis zur Loesung oder den Fehlerfall:
            if (!newState.isBetterThan(subState)) {
                return subState;
            }
            subState = new SolutionState(newState.board, [...subState.sets, ...newState.sets]);
        } while (subState.isIncomplete());   // das Ganze geht, bis das Board voll ist

        console.log("Freie Felder: " + subState.emptyFieldCount);
        return subState;
    }

    #checkOneStep(testBoard: Board, step: Step): [boolean, number, Step[]] {
        //  Führt den step auf dem testBoard aus und füllt alle logisch herleitbaren Steps durch. 
        //  Return:
        //      boolean: ist das Board gelöst
        //      number:     die Anzahl der durch den Step (+Logik) neu gefüllten Felder
        //                  bei Fehler 0, sonst mindestens 1 (der Step selbst)
        let board = testBoard.copy();
        let doLogging = true;
        let solvedSteps = [step];

        let emptyFieldCount = board.emptyFieldCount();
        board.addStep(step);

        try {
            solvedSteps.push(...this._solver.findLogicalSteps(board));
            if (board.isFull()) {
                //  we found a solution
                let win = (emptyFieldCount-board.emptyFieldCount());
                if (doLogging) {
                    console.log("Step " + step.toString() + " would clean " + win + " digits.");
                    if (board.isFull()) {
                        console.log("... and board is FULL.");
                    } else {
                        console.log("... but still missing " + board.emptyFieldCount() + " digits.");
                    }
                    console.log("==> It will yield a solution.");
                }
                return [true, win, solvedSteps];
            }
        } catch(error) {
            if (error instanceof BoardError) {
                if (doLogging) {
                    console.log("Step " + step.toString() + " yields to an ERROR.");
                }
                return [false, 0, []];
            }
        }
        //  No solution, but the digit leads further to a solution
        return [false, emptyFieldCount-board.emptyFieldCount(), solvedSteps];
    }

    #trySolvingOneFieldContent(board: Board, fc: FieldContent): [boolean, Step, number, Step[]] {
        //  Prüft jedes erlaubte Digit, das im übergebenen FieldContent erlaubt ist,
        //  ob es das board löst, zu einem Fehler führt oder nur vorwärts bringt.
        //  Return:
        //      boolean:    board ist gelöst
        //      Step:       der Step, des FieldContents, der verwendet wurde
        //      number:     die Anzahl der zusätzlich eingetragenen Digits (Step + Logik)
        let doLogging = true;
        let bestStep = new Step(Cause.TRIAL_CIPHER, fc.pos);    // dummy
        let bestWin = 0;
        let bestSteps: Step[] = [];
        let isSolved: boolean;
        let win: number;

        for (let digit of fc.allowSet.entries) {
            let testStep = new Step(Cause.TRIAL_CIPHER, fc.pos, digit);
            let solvedSteps: Step[];

            [isSolved, win, solvedSteps] = this.#checkOneStep(board, testStep);
            if (win == 1) {
                testStep._cause = Cause.ANY_CIPHER;
            }
            if (isSolved) {
                return [true, testStep, win, solvedSteps];
            }

            if (win > bestWin) {
                bestWin = win;
                bestStep = testStep;
                bestSteps = solvedSteps;
            }
            if (doLogging) {
                console.log("Move " + testStep.toString() + " would clean " + win + " digits.");
            }
        }
        return [false, bestStep, bestWin, bestSteps];
    }

    #getCandidates(board: Board, reversed: boolean=false): FieldContent[] {
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
        if (reversed) {
            fcCandidates.reverse();
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

    #checkOneCandidate(board: Board, fc: FieldContent):[boolean, Step | undefined, Step[]] {
        let doLogging = true;
        let resolutionStep: Step;
        let isSolving: boolean;
        let digitWin: number;
        let resolvingSteps: Step[];

        [isSolving, resolutionStep, digitWin, resolvingSteps] = this.#trySolvingOneFieldContent(board, fc);
        if (isSolving) {
            if (doLogging) {
                console.log("Found resolving step at " + resolutionStep.toString())
            }
            return [true, resolutionStep, resolvingSteps];
        } else {
            if (resolutionStep.hasDigit()) {
                if (doLogging) {
                    console.log("Found step at " + resolutionStep.toString() + " that cleans " + digitWin + " digits.");
                }
                return [false, resolutionStep, resolvingSteps];
            } else {
                if (doLogging) {
                    console.log("Found no resolving step at " + resolutionStep.pos.toString());
                }
            }
        }
        return [false, undefined, []];
    }

    findAllResolvingSteps(board: Board, reversed: boolean=true): [boolean, Step[]] {
        let isSolving = false;
        let doLogging = true;
        let solutionSteps: Step[] = [];

        let fcCandidates = this.#getCandidates(board, reversed);

        if (doLogging) {
            this.#logCandidates(fcCandidates);
        }

        if (fcCandidates[0].allowSet.length <= 3) {
            let possibleSolutionSteps: Step[] = [];
            let resultStep: Step | undefined;
            let resultSteps: Step[];

            for (let fc of fcCandidates) {
                [isSolving, resultStep, resultSteps] = this.#checkOneCandidate(board, fc);
                if (resultStep != undefined) {
                    if (isSolving) {
                        solutionSteps.push(...resultSteps);
                        if (doLogging) {
                            console.log("Found solving steps:");
                            for (let step of solutionSteps) {
                                console.log("   " + step.toString());
                            }
                        }
                        break;
                    } else {
                        possibleSolutionSteps.push(resultStep);
                    }
                }
            }
            if (solutionSteps.length == 0) {
                //  No solution found; so we must dig deeper with possible solution steps
                if (doLogging) {
                    console.log("Found " + possibleSolutionSteps.length + " possible solutions moves.");
                }
                for (let checkStep of possibleSolutionSteps) {
                    let testBoard = board.copy();
                    testBoard.addStep(checkStep);

                    try {
                        let foundSteps: Step[] = [];
                        [isSolving, foundSteps] = this.findAllResolvingSteps(testBoard);
                        if (foundSteps.length > 0) {
                            solutionSteps.push(checkStep);
                            solutionSteps.push(...foundSteps);
                        }
                        if (isSolving) {
                            console.log("Found solving steps:");
                            for (let step of solutionSteps) {
                                console.log("   " + step.toString());
                            }
                            break;
                        }
                    } catch(error) {
                        if (error instanceof BoardError) {
                            if (doLogging) {
                                console.log("Step " + checkStep.toString() + " yields to an ERROR.");
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
        return [isSolving, solutionSteps];
    }
}