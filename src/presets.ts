import Color from "./Color";

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
const presetDefinitions = {
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
    "7_R": {
        board: [" *  *  * -KI-OU-KI-GI *  * "].concat(BOARD2_9),
        turn: Color.White,
    },
    "7_L": {
        board: [" *  * -GI-KI-OU-KI *  *  * "].concat(BOARD2_9),
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

export type IPreset = keyof typeof presetDefinitions;
export const getInitialFromPreset = (preset: string) => {
    const definition = presetDefinitions[preset];
    if (!definition) {
        throw new Error(`Unknown preset: ${preset}`);
    }
    return definition;
};

const presets = Object.keys(presetDefinitions);
export default presets;
