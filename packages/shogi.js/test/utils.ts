import {screen} from "@testing-library/react";

export function sortMoves(moves) {
    return moves.sort((a, b) => {
        if (a.from) {
            if (b.from) {
                return dic(compareXY(a.from, b.from), compareXY(a.to, b.to));
            } else {
                return 1;
            }
        } else {
            if (b.from) {
                return -1;
            } else {
                return dic(kindToNum(a.kind) - kindToNum(b.kind), compareXY(a.to, b.to));
            }
        }
    });

    function compareXY(a, b) {
        return dic(a.x - b.x, a.y - b.y);
    }

    function dic(a, b) {
        return a !== 0 ? a : b;
    }

    function kindToNum(kind) {
        return ["FU", "KY", "KE", "GI", "KI", "KA", "HI", "OU"].indexOf(kind);
    }
}

export function boardBitMapToXYs(boardBitMap): {
    [key: string]: Array<{x: number; y: number}>;
} {
    const boardRows = boardBitMap.split("\n");
    const ret = {};
    for (let y = 0; y < boardRows.length; y++) {
        const row = boardRows[y];
        for (let x = 0; x < row.length; x++) {
            const char = row[x];
            if (!ret[char]) {
                ret[char] = [];
            }
            ret[char].push({x: row.length - x, y: y + 1});
        }
    }
    return ret;
}
