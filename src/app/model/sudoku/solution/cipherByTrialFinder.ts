import { Board } from "../board";
import { FieldContent, Cause } from "../fieldContent";
import { Move } from "../move";
import { Solver } from "../solver";


export class CipherByTrialFinder {
    _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
    }

    #findOneSolvingMoveByTrial(board: Board, fc: FieldContent): [boolean, Move, number] {
        //  Check how far any allowed cipher of the given FieldContent
        //  gets to a board solution or if it leads to an error
        let doLogging = false;
        let resolutionMove = new Move(fc.pos);    // dummy
        let emptyFieldCount: number;
        let testBoard: Board;
        let testPos = fc.pos;
        let testMove: Move;
        let bestWin = 0;

        for (let digit of fc.allowSet.entries) {
            testBoard = board.copy();
            testBoard.stopInitialize();
            testMove = new Move(testPos, digit);
            testBoard.add(testMove, Cause.TRIAL_CIPHER);
            emptyFieldCount = testBoard.emptyFields();
            this._solver.solve(testBoard);
            if (testBoard.isFull()) {
                //  we found a solution
                let win = (emptyFieldCount-testBoard.emptyFields());
                if (doLogging) {
                    console.log("Move " + testMove.toString() + " would clean " + win + " digits.");
                    console.log("==> It will yield a solution.");
                }
                return [true, testMove, win];
            }
            
            //  we found NO solution ...
            if (testBoard.hasErrors()) {
                //  ... because the digit yields an error in the end
                if (doLogging) {
                    console.log("Move " + testMove.toString() + " yields an ERROR.");
                }
            } else {
                //  ... because the digit just leads further to a solution
                let win = (emptyFieldCount-testBoard.emptyFields());
                if (win > bestWin) {
                    bestWin = win;
                    resolutionMove = testMove;
                }
                if (doLogging) {
                    console.log("Move " + testMove.toString() + " would clean " + win + " digits.");
                }
            }
        }
        return [false, resolutionMove, bestWin];
    }

    findAllResolvingMoves(board: Board): Move[] {
        let doLogging = true;
        let fcCandidates: FieldContent[] = [];
        let count = 9;
        let resolutionMove: Move;   //dummy
        let solutionMoves: Move[] = []
        let isSolving: boolean;
        let digitWin: number;

        for (let fc of board.allEmptyFieldContents()) {
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
        if (doLogging) {
            console.log();
            console.log("Minimal candidate size is " + count);
            console.log("Found " + fcCandidates.length + " candidates of this size:");
            for (let fc of fcCandidates) {
                console.log("   " + fc.toString())
            }
        }
        if (count == 2) {
            let possibleSolutionMoves: Move[] = [];
            for (let fc of fcCandidates) {
                [isSolving, resolutionMove, digitWin] = this.#findOneSolvingMoveByTrial(board, fc);
                if (isSolving) {
                    if (doLogging) {
                        console.log("Found resolving move at " + resolutionMove.toString())
                    }
                    solutionMoves.push(resolutionMove);
                } else {
                    if (resolutionMove.hasDigit()) {
                        if (doLogging) {
                            console.log("Found move at " + resolutionMove.toString() + " that cleans " + digitWin + " digits.");
                        }
                        possibleSolutionMoves.push(resolutionMove);
                    } else {
                        if (doLogging) {
                            console.log("Found no resolving move at " + resolutionMove.pos.toString());
                        }
                    }
                }
            }
            if (solutionMoves.length == 0) {
                if (doLogging) {
                    console.log("Found " + possibleSolutionMoves.length + " possible solutions moves.");
                }
                for (let checkMove of possibleSolutionMoves) {
                    let testBoard = board.copy();
                    testBoard.stopInitialize();
                    testBoard.add(checkMove, Cause.TRIAL_CIPHER);
                    this._solver.solve(testBoard);
                    if (this.findAllResolvingMoves(testBoard).length > 0) {
                        solutionMoves.push(checkMove);
                    }
                }
            }
        } else {
            if (doLogging) {
                console.log("Minimal count of all empty fields is " + count)
            }
        }
        return solutionMoves;
    }

}