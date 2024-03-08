import { Board, BoardError } from "../board";
import { FieldContent, Cause } from "../fieldContent";
import { Move } from "../move";
import { Solver } from "../solver";


export class CipherByTrialFinder {
    static cause = Cause.TRIAL_CIPHER;
    _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
    }

    #checkOneMove(testBoard: Board, move: Move): [boolean, number] {
        let board = testBoard.copy();
        let doLogging = true;

        board.add(move, Cause.TRIAL_CIPHER);
        let emptyFieldCount = board.emptyFieldCount();

        try {
            if (this._solver.solveOneLevel(board)) {
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

    solveAll(board: Board) {
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
                        board.add(resultMove, Cause.TRIAL_CIPHER);
                        this.solveAll(board);
                        return;
                    }
                    possibleSolutionMoves.push(resultMove);
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
                        this._solver.solveOneLevel(testBoard);
                        if (this.findAllResolvingMoves(testBoard).length > 0) {
                            board.add(checkMove, Cause.TRIAL_CIPHER);
                            this.solveAll(board);
                            return;
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
        return undefined;
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
                        this._solver.solveOneLevel(testBoard);
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

    findOneResolvingMove(board: Board): Move | undefined {
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
                        return resultMove;
                    }
                    possibleSolutionMoves.push(resultMove);
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
                        this._solver.solveOneLevel(testBoard);
                        if (this.findAllResolvingMoves(testBoard).length > 0) {
                            return checkMove;
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
        return undefined;
    }

}