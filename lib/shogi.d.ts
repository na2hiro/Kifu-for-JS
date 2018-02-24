/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import Color from "./Color";
import Piece from "./Piece";
import "./polyfills";
export default class Shogi {
    static preset: {
        [index: string]: {
            board: string[];
            turn: Color;
        };
    };
    private static getIllegalUnpromotedRow(kind);
    private static getRowToOppositeEnd(y, color);
    board: Piece[][];
    hands: Piece[][];
    turn: Color;
    flagEditMode: boolean;
    constructor(setting?: ISettingType);
    initialize(setting?: ISettingType): void;
    initializeFromSFENString(sfen: string): void;
    editMode(flag: boolean): void;
    move(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean): void;
    unmove(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean, capture?: string): void;
    drop(tox: number, toy: number, kind: string, color?: Color): void;
    undrop(tox: number, toy: number): void;
    toCSAString(): string;
    toSFENString(moveCount?: number): string;
    getMovesFrom(x: number, y: number): IMove[];
    getDropsBy(color: Color): IMove[];
    getMovesTo(x: number, y: number, kind: string, color?: Color): IMove[];
    get(x: number, y: number): Piece;
    getHandsSummary(color: Color): {
        [index: string]: number;
    };
    captureByColor(x: number, y: number, color: Color): void;
    flip(x: number, y: number): boolean;
    setTurn(color: Color): void;
    private set(x, y, piece);
    private capture(x, y);
    private pushToHand(piece);
    private popFromHand(kind, color);
    private nextTurn();
    private prevTurn();
    private checkTurn(color);
}
export interface ISettingType {
    preset: string;
    data?: {
        color: Color;
        board: Array<Array<{
            color?: Color;
            kind?: string;
        }>>;
        hands: Array<{
            [index: string]: number;
        }>;
    };
}
export interface IMove {
    from?: {
        x: number;
        y: number;
    };
    to: {
        x: number;
        y: number;
    };
    kind?: string;
    color?: Color;
}
