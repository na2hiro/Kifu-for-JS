import Color from "./Color";
import IMoveDefinition from "./IMoveDefinition";

const EMPTY = " *  *  *  *  *  *  *  *  * ";
const BOARD3_9 = [
    "-FU-FU-FU-FU-FU-FU-FU-FU-FU",
    EMPTY,
    EMPTY,
    EMPTY,
    "+FU+FU+FU+FU+FU+FU+FU+FU+FU",
    " * +KA *  *  *  *  * +HI * ",
    "+KY+KE+GI+KI+OU+KI+GI+KE+KY",
];
const BOARD2_9 = [EMPTY].concat(BOARD3_9);

/**
 * 既定の初期局面
 */
export const PRESET: Readonly<{
    [index: string]: Readonly<{readonly board: string[]; readonly turn: Color}>;
}> = {
    HIRATE: {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE-KY", " * -HI *  *  *  *  * -KA * "].concat(BOARD3_9),
        turn: Color.Black,
    },
    KY: {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE * ", " * -HI *  *  *  *  * -KA * "].concat(BOARD3_9),
        turn: Color.White,
    },
    KY_R: {
        board: [" * -KE-GI-KI-OU-KI-GI-KE-KY", " * -HI *  *  *  *  * -KA * "].concat(BOARD3_9),
        turn: Color.White,
    },
    KA: {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE-KY", " * -HI *  *  *  *  *  *  * "].concat(BOARD3_9),
        turn: Color.White,
    },
    HI: {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE-KY", " *  *  *  *  *  *  * -KA * "].concat(BOARD3_9),
        turn: Color.White,
    },
    HIKY: {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE * ", " *  *  *  *  *  *  * -KA * "].concat(BOARD3_9),
        turn: Color.White,
    },
    "2": {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE-KY"].concat(BOARD2_9),
        turn: Color.White,
    },
    "3": {
        board: ["-KY-KE-GI-KI-OU-KI-GI-KE * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "4": {
        board: [" * -KE-GI-KI-OU-KI-GI-KE * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "5": {
        board: [" *  * -GI-KI-OU-KI-GI-KE * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "5_L": {
        board: [" * -KE-GI-KI-OU-KI-GI *  * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "6": {
        board: [" *  * -GI-KI-OU-KI-GI *  * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "8": {
        board: [" *  *  * -KI-OU-KI *  *  * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "10": {
        board: [" *  *  *  * -OU *  *  *  * "].concat(BOARD2_9),
        turn: Color.White,
    },
};

const F = [0, -1];
const B = [0, 1];
const L = [1, 0];
const R = [-1, 0];
const FR = [-1, -1];
const FL = [1, -1];
const BR = [-1, 1];
const BL = [1, 1];

const kin = {just: [FR, F, FL, R, L, B]};

export const MOVE_DEF: Readonly<{
    [index: string]: Readonly<IMoveDefinition>;
}> = {
    FU: {just: [F]},
    KY: {fly: [F]},
    KE: {
        just: [
            [-1, -2],
            [1, -2],
        ],
    },
    GI: {just: [FR, F, FL, BR, BL]},
    KI: kin,
    TO: kin,
    NY: kin,
    NK: kin,
    NG: kin,
    KA: {fly: [FR, FL, BR, BL]},
    HI: {fly: [F, R, L, B]},
    OU: {just: [FR, F, FL, R, L, BR, B, BL]},
    UM: {fly: [FR, FL, BR, BL], just: [F, R, L, B]},
    RY: {fly: [F, R, L, B], just: [FR, FL, BR, BL]},
};
