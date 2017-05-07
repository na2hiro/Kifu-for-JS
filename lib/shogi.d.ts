/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
export declare enum Color {
    Black = 0,
    White = 1,
}
export declare class Shogi {
    static preset: {
        [index: string]: {
            board: string[];
            turn: Color;
        };
    };
    board: Piece[][];
    hands: Piece[][];
    turn: Color;
    flagEditMode: boolean;
    constructor(setting?: SettingType);
    initialize(setting?: SettingType): void;
    initializeFromSFENString(sfen: string): void;
    editMode(flag: boolean): void;
    move(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean): void;
    unmove(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean, capture?: string): void;
    drop(tox: number, toy: number, kind: string, color?: Color): void;
    undrop(tox: number, toy: number): void;
    toCSAString(): string;
    toSFENString(moveCount?: number): string;
    getMovesFrom(x: number, y: number): Move[];
    getDropsBy(color: Color): Move[];
    getMovesTo(x: number, y: number, kind: string, color?: Color): Move[];
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
export interface SettingType {
    preset: string;
    data?: {
        color: Color;
        board: {
            color?: Color;
            kind?: string;
        }[][];
        hands: {
            [index: string]: number;
        }[];
    };
}
export interface Move {
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
export interface MoveDefinition {
    just?: number[][];
    fly?: number[][];
}
export declare class Piece {
    color: Color;
    kind: string;
    constructor(csa: string);
    promote(): void;
    unpromote(): void;
    inverse(): void;
    toCSAString(): string;
    toSFENString(): string;
    static promote(kind: string): string;
    static unpromote(kind: string): string;
    static canPromote(kind: string): boolean;
    static getMoveDef(kind: string): MoveDefinition;
    static isPromoted(kind: string): boolean;
    static oppositeColor(color: Color): Color;
    static fromSFENString(sfen: string): Piece;
}
