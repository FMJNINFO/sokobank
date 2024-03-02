
export class Position {
    static NoPosition = new Position(-1);
    private static _pool: Position[] = Position._initPool();
    private static _rows: Position[][] = Position._initRows();
    private static _cols: Position[][] = Position._initCols();
    private static _boxs: Position[][] = Position._initBoxs();
    private static _namedGroups: Map<string, Position[]> = Position._initNamedGroups()

    //       C0  C1  C2   C3  C4  C5   C6  C7  C8
    //
    // R0     0   1   2    3   4   5    6   7   8
    // R1     9  10  11   12  13  14   15  16  17
    // R2    18  19  20   21  22  23   24  25  26
    //
    // R3    27  28  29   30  31  32   33  34  35
    // R4    36  37  38   39  40  41   42  43  44
    // R5    45  46  47   48  49  50   51  52  53
    //
    // R6    54  55  56   57  58  59   60  61  62
    // R7    63  64  65   66  67  68   69  70  71
    // R8    72  73  74   75  76  77   78  79  80
    //

    private _posId: number;    //  0 .. 80
    private _rowId: number;
    private _colId: number;
    private _boxId: number;

    private constructor(pos: number) {
        this._posId = pos;
        this._rowId = Math.floor(pos/9);
        this._colId = pos % 9;
        this._boxId = (3 * Math.floor(pos/27)) + Math.floor((pos % 9)/3);
    }

    isUndefined(): boolean {
        return this._posId === -1;
    }

    get pos(): number {
        return this._posId;
    }
    get row(): number {
        return this._rowId;
    }
    get col(): number {
        return this._colId;
    }
    get box(): number {
        return this._boxId;
    }

    get groups(): Position[][] {
        let grps: Position[][] = [];
        grps.push(Position.row(this.row));
        grps.push(Position.col(this.col));
        grps.push(Position.box(this.box));
        return grps;
    }

    toString(): string {
        let s = "["+this.row+","+this.col+"]";
        return s;
    }

    equals(other: any): boolean {
        if (other instanceof Position) {
            let otherPos: Position = other;
            if (otherPos._posId == this._posId) {
                return true;
            }
        }
        return false;
    }

    right(): Position {
        if (this.isUndefined()) {
            return this;
        }
        if (this.col === 8) {
            return Position.of(9*this.row);
        }
        return Position.of(this.pos+1);        
    }

    left(): Position {
        if (this.isUndefined()) {
            return this;
        }
        if (this.col === 0) {
            return Position.of(9*this.row+8);
        }
        return Position.of(this.pos-1);        
    }

    up(): Position {
        if (this.isUndefined()) {
            return this;
        }
        if (this.row === 0) {
            return Position.of(8*9+this.col);
        }
        return Position.of(this.pos-9);        
    }

    down(): Position {
        if (this.isUndefined()) {
            return this;
        }
        if (this.row === 8) {
            return Position.of(this.col);
        }
        return Position.of(this.pos+9);        
    }

    static of(pos: number): Position {
        return Position._pool[pos];
    }

    static row(rowId: number): Position[] {
        let newRow: Position[] = [];
        let startPos = rowId * 9;
        for (let i=0; i<9; i++) {
            newRow.push(Position.of(startPos+i));
        }
        return newRow;
    }

    static col(colId: number): Position[] {
        let newCol: Position[] = [];
        for (let i=0; i<81; i+=9) {
            newCol.push(Position.of(colId+i));
        }
        return newCol;
    }

    static box(boxId: number): Position[] {
        let newBox: Position[] = [];

        let startPos = 27 * Math.floor(boxId/3) + 3 * (boxId % 3);
        for (let j=0; j<27; j+=9) {
            for (let i=0; i<3; i++) {
                newBox.push(Position.of(startPos+j+i));
            }
        }
        return newBox;
    }

    static pool(): Position[] {
        return Position._pool;
    }

    static _initPool() : Position[] {
        let pool: Position[] = [];
        for (let i=0; i<81; i++) {
            pool.push( new Position(i) );
        }
        return pool;
    }

    static _initRows() : Position[][] {
        let rows: Position[][] = [];
        let row: Position[];
        let startPos: number;
        for (let idx=0; idx<9; idx++) {
            row = [];
            startPos = idx * 9;
            for (let fld=0; fld<9; fld++) {
                row.push(Position.of(startPos+fld));
            }
            rows.push(row);
        }
        return rows;
    }

    static _initCols() : Position[][] {
        let cols: Position[][] = [];
        let col: Position[];
        for (let idx=0; idx<9; idx++) {
            col = [];
            for (let fld=0; fld<81; fld+=9) {
                col.push(Position.of(idx+fld));
            }
            cols.push(col);
        }
        return cols;
    }

    static _initBoxs() : Position[][] {
        let boxs: Position[][] = [];
        let box: Position[];
        let startPos: number;
        for (let idx=0; idx<9; idx++) {
            box = [];
            startPos = 27 * Math.floor(idx/3) + 3 * (idx % 3);
            for (let fld=0; fld<27; fld+=9) {
                for (let ofs=0; ofs<3; ofs++) {
                    box.push(Position.of(startPos+fld+ofs));
                }
            }
            boxs.push(box);
        }
        return boxs;
    }

    static _initNamedGroups() : Map<string, Position[]> {
        let grps: Map<string, Position[]> = new Map();
        let grp: Position[];
        let i = 0;
        for (grp of this._rows) {            
            grps.set('Row'+i, grp);
            i += 1;
        }
        i = 0;
        for (grp of this._cols) {            
            grps.set('Col'+i, grp);
            i += 1;
        }
        i = 0;
        for (grp of this._boxs) {            
            grps.set('Box'+i, grp);
            i += 1;
        }
        return grps;
    }

    static namedGrps() : Map<string, Position[]> {
        return Position._namedGroups;
    }

    static namedGroup(sGrp: string): Position[] {
        let poss = Position._namedGroups.get(sGrp);
        if (poss == undefined) {
            return [];
        }
        return poss;
    }

    static allGrps() : Position[][] {
        return Array.from(Position._namedGroups.values());
    }
}