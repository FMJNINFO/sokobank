import { Board } from "../board";
import { Cause } from "../cause";
import { CipherSet } from "../cipherset";
import { FieldContent } from "../fieldContent";
import { Position } from "../position";
import { Solver } from "../solver";
import { Step } from "../step";


export class UniqueCipherFinder {
    static username = "UniqueCipher";
    static cause = Cause.UNIQUE_CIPHER;
    _solver: Solver;

    constructor(solver: Solver) {
        this._solver = solver;
    }

    #candidates(board: Board, group: Position[]): FieldContent[] {
        return board.fieldContentsOf(group).filter((fc) => fc.isEmpty());
    }

    #findAllInGroup(board: Board, group: Position[]): Step[] {
        const fcs = this.#candidates(board, group);
        const frequency = fcs.reduce((frq, fc) => fc.allowSet.addFrequency(frq), CipherSet.emptyFrequency());

        let steps: Step[] = []        
        let fc: FieldContent | undefined;
        let digit: number;

        for (let j=0; j<9; j++) {
            if (frequency[j] === 1) {
                digit = j+1;
                fc = fcs.find((fc) => fc.allowSet.contains(digit));
                if (fc === undefined) {
                    throw new SyntaxError("Should never happen.")
                }
                steps.push(new Step(Cause.UNIQUE_CIPHER, fc.pos, digit));
            }                                    
        }
        return steps;
    }

    getAllSteps(board: Board): Step[] {
        let doLogging = false;
        let founds: Map<number, Step> = new Map();
        let steps: Step[];

        if (doLogging) {
            console.log("== getAllSteps ==");
        }
        for (let [sGrp, grp] of Position.namedGrps()) {        
            steps = this.#findAllInGroup(board, grp);
            for (let step of steps) {
                if (doLogging) {
                    console.log("   Add " + step.toString() + " from " + sGrp);
                }
                founds.set(step.pos.pos, step);
            }
        }
        steps = Array.from(founds.values());
        return steps;        
    }

    #findGroupUniqueCiphers(board: Board, group: Position[], findAll: boolean=true): Step[] {
        let emptyFields: FieldContent[] = [];
        let frequency: number[];
        let fc: FieldContent | undefined;
        let steps: Step[] = [];
        let step: Step;

        frequency = CipherSet.emptyFrequency();
        emptyFields = board.fieldContentsOf(group).filter((fc) => fc.isEmpty()); 
        for (let fc of emptyFields) {
            frequency = fc.allowSet.addFrequency(frequency);
        }
        for (let j=0; j<9; j++) {
            if (frequency[j] == 1) {
                fc = emptyFields.find((fc) => fc.allowSet.contains(j+1));
                if (fc != undefined) {
                    if (steps.find((s) => (fc!=undefined) && (s.pos.pos == fc.pos.pos)) == undefined) {
                        step = new Step(Cause.UNIQUE_CIPHER, fc.pos, j+1);
                        steps.push(step);
                        if (!findAll) {
                            return steps;
                        }
                    }
                }                                    
            }
        }
        return steps;
    }    

    findUniqueCiphers(board: Board): Step[] {
        let doLogging = false;
        let steps: Step[];
        let joinedSteps: Step[] = [];
        for (let [sGrp, grp] of Position.namedGrps()) {
            if (doLogging)
                console.log("Look for unique cipher in " + sGrp)
            steps = this.#findGroupUniqueCiphers(board, grp);
            for (let step of steps) {
                if (doLogging)
                    console.log("Found unique cipher in " + sGrp + ": " + step.toString())
                if (joinedSteps.find((s) => (s.pos.pos == step.pos.pos)) == undefined) {
                    joinedSteps.push(step);
                } else {
                    if (doLogging)
                        console.log("... but we know it already.")
                }
            }
        }
        return joinedSteps;
    }
}