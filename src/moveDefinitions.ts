import IMoveDefinition from "./IMoveDefinition";
import {Kind} from "./Kind";

const F = [0, -1];
const B = [0, 1];
const L = [1, 0];
const R = [-1, 0];
const FR = [-1, -1];
const FL = [1, -1];
const BR = [-1, 1];
const BL = [1, 1];

const kin = {just: [FR, F, FL, R, L, B]};

const MOVE_DEF: {[index in Kind]: IMoveDefinition} = {
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

export function getMoveDefinitions(kind: Kind) {
    return MOVE_DEF[kind];
}
