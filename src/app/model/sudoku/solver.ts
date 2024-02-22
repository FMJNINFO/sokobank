import { Board } from "./board";
import { ClosedGroup, ClosedGroups } from "./closedGroups";
import { Cause, FieldContent } from "./fieldContent";
import { GroupCleaner } from "./groupCleaner";
import { Move } from "./move";
import { MoveFinder } from "./moveFinder";
import { Position } from "./position";


export class Solver {
    moveFinder: MoveFinder;
    groupCleaner: GroupCleaner;

    constructor() {
        this.moveFinder = new MoveFinder();
        this.groupCleaner = new GroupCleaner();
    }

    findAllLonelyCiphers(board: Board): Move[] {
        return this.moveFinder.findLonelyCiphers(board, true);
    }

    _findOneLonelyCipher(board: Board): Move {
        var moves = this.moveFinder.findLonelyCiphers(board, false);

        if (moves.length < 1) {
            return new Move(Position.NoPosition);     // empty dummy
        }
        return moves[0];
    }

    findAllUniqueCiphers(board: Board): Move[] {
        return this.moveFinder.findUniqueCiphers(board, true);
    }

    _findOneUniqueCipher(board: Board): Move {
        var moves = this.moveFinder.findUniqueCiphers(board, false);

        if (moves.length < 1) {
            return new Move(Position.NoPosition);     // empty dummy
        }
        return moves[0];
    }

    findAllClosedGroups(board: Board): ClosedGroups {
        return this.groupCleaner.findClosedGroups(board, true)
    }

    findBestClosedGroup(board: Board): ClosedGroup | undefined {
        var doLogging = false;      
        var closedGroups = this.findAllClosedGroups(board).sortedBySize();
        var bestLevel = 0;
        var bestLength = 9;
        var bestGroup = undefined;

        for (let closedGroup of closedGroups) {
            let level = closedGroup.cleaningLevel(board);
            if (level > 0) {
                if (bestGroup === undefined) {
                    bestLevel = level;
                    bestGroup = closedGroup;
                    bestLength = closedGroup.length;                
                } else {
                    if (level > bestLevel) {
                        bestLevel = level;
                        bestGroup = closedGroup;
                        bestLength = closedGroup.length;                
                    } else if (level == bestLevel) {
                        if (closedGroup.length < bestLength) {
                            bestLevel = level;
                            bestGroup = closedGroup;
                            bestLength = closedGroup.length;                    
                        }
                    }
                }
            }
        }
        if (doLogging) {
            if (bestLevel > 0) {
                console.log("Best Closed Group would clean " + bestLevel + " digits by " + bestLength + " length.");
            } else {
                console.log("No usable closed group found.");
            }
        }
        return bestGroup;
    }

    _findOneClosedGroup(board: Board, but: Set<ClosedGroup>=new Set()) {
        var closedGroups = this.groupCleaner.findClosedGroups(board, true);        

        for (let i=0; i<closedGroups.length; i++) {
            let closedGroup = closedGroups.group(i);
            if (!closedGroup.in(but)) {
                return closedGroup;
            }
        }
        return closedGroups.group(closedGroups.length); // dummy
    }

    _findOneSolvingMoveByTrial(board: Board, fc: FieldContent): [boolean, Move, number] {
        //  Check how far any allowed cipher of the given FieldContent
        //  gets to a board solution or if it leads to an error
        var doLogging = false;
        var resolutionMove = new Move(fc.pos);    // dummy
        var emptyFieldCount: number;
        var testBoard: Board;
        var testPos = fc.pos;
        var testMove: Move;
        var bestWin = 0;

        for (let digit of fc.allowSet.entries) {
            testBoard = board.copy();
            testBoard.stopInitialize();
            testMove = new Move(testPos, digit);
            testBoard.add(testMove, Cause.TRIAL_CIPHER);
            emptyFieldCount = testBoard.emptyFields();
            this.solve(testBoard);
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
        var doLogging = false;
        var fcCandidates: FieldContent[] = [];
        var count = 9;
        var resolutionMove: Move;   //dummy
        var solutionMoves: Move[] = []
        var isSolving: boolean;
        var digitWin: number;

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
        if (count == 2) {
            var possibleSolutionMoves: Move[] = [];
            for (let fc of fcCandidates) {
                [isSolving, resolutionMove, digitWin] = this._findOneSolvingMoveByTrial(board, fc);
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
                    this.solve(testBoard);
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

    solve(board: Board): boolean {
        var doLogging = false;

        var retry: boolean;
        var move: Move;
        var knownGroups = new Set<ClosedGroup>();

        do {
            retry = false;
            move = this._findOneLonelyCipher(board);
            if (move.hasDigit()) {
                retry = true;
                board.add(move, Cause.LONELY_CIPHER);
                knownGroups.clear();
                continue;
            }
            move = this._findOneUniqueCipher(board);
            if (move.hasDigit()) {
                retry = true;
                board.add(move, Cause.UNIQUE_CIPHER);
                knownGroups.clear();
                continue;
            }

            let closedGroup = this._findOneClosedGroup(board, knownGroups);
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
