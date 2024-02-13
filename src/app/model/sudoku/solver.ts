import { Board } from "./board";
import { ClosedGroup, ClosedGroups } from "./closedGroups";
import { FieldContent } from "./fieldContent";
import { GroupCleaner } from "./groupCleaner";
import { logBoard } from "./logger";
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

    _findOneSolvingMoveByTrial(board: Board, fc: FieldContent): Move {
        var resolutionMove = new Move(fc.pos);    // dummy
        var emptyFieldCount: number;
        var testBoard: Board;
        var testPos = fc.pos;
        var testMove: Move;

        for (let digit of fc.allowSet.entries) {
            testBoard = board.copy();
            testBoard.stopInitialize();
            testMove = new Move(testPos, digit);
            testBoard.add(testMove);
            emptyFieldCount = testBoard.emptyFields();
            this.solve(testBoard);
            if (testBoard.isFull()) {
                resolutionMove = testMove;
                console.log("Move " + testMove.toString() + " yields a solution.");
                break;
            } else {
                logBoard(testBoard);
                if (testBoard.hasErrors()) {
                    console.log("Move " + testMove.toString() + " yields an ERROR.");
                } else {
                    console.log("Move " + testMove.toString() + " yields " + (emptyFieldCount-testBoard.emptyFields()) + " field contents.")
                }
            }
        }
        return resolutionMove;
    }

    findAllResolvingMoves(board: Board): Move[] {
        var fcCandidates: FieldContent[] = [];
        var count = 9;
        var resolutionMove: Move;   //dummy
        var solutionMoves: Move[] = []

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
            for (let fc of fcCandidates) {
                resolutionMove = this._findOneSolvingMoveByTrial(board, fc);
                if (resolutionMove.hasDigit()) {
                    console.log("Found resolving move at " + resolutionMove.toString())
                    solutionMoves.push(resolutionMove)
                } else {
                    console.log("Found no resolving move at " + resolutionMove.pos.toString())
                }
            }
        } else {
            console.log("Minimal count of all empty fields is " + count)
        }
        return solutionMoves;
    }

    solve(board: Board) {
        var doLogging = true;

        var retry: boolean;
        var move: Move;
        var knownGroups = new Set<ClosedGroup>();

        do {
            retry = false;
            move = this._findOneLonelyCipher(board);
            if (move.hasDigit()) {
                retry = true;
                board.add(move);
                knownGroups.clear();
                continue;
            }
            move = this._findOneUniqueCipher(board);
            if (move.hasDigit()) {
                retry = true;
                board.add(move);
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
            for (let fc of board.allFieldContents()) {
                console.log(fc.getMove().toString());
            }
        } else {
            let closedGroups = this.findAllClosedGroups(board);

            if (doLogging) {
                if (closedGroups.length == 0) {
                    console.log("Looking for a closed group, but found none." );
                } else {
                    console.log("Looking for a closed group and found one." );
                }
            }
        }
    }
}
