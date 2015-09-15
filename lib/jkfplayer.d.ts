/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import ShogiJS = require('../node_modules/shogi.js/lib/shogi');
import Shogi = ShogiJS.Shogi;
import JKF = require('./JSONKifuFormat');
export = JKFPlayer;
declare class JKFPlayer {
    shogi: Shogi;
    kifu: JKF.JSONKifuFormat;
    tesuu: number;
    forks: {
        te: number;
        moves: JKF.MoveFormat[];
    }[];
    static debug: boolean;
    static _log: any[];
    static log(...lg: any[]): void;
    constructor(kifu: JKF.JSONKifuFormat);
    initialize(kifu: JKF.JSONKifuFormat): void;
    static parse(kifu: string, filename?: string): JKFPlayer;
    static parseJKF(kifu: string): JKFPlayer;
    static parseKIF(kifu: string): JKFPlayer;
    static parseKI2(kifu: string): JKFPlayer;
    static parseCSA(kifu: string): JKFPlayer;
    static addLastNewLine(kifu: string): string;
    static numToZen(n: number): string;
    static numToKan(n: number): string;
    static kindToKan(kind: string): string;
    static relativeToKan(relative: string): any;
    static specialToKan(special: string): any;
    static moveToReadableKifu(mv: JKF.MoveFormat): string;
    static doMove(shogi: Shogi, move: JKF.MoveMoveFormat): void;
    static undoMove(shogi: Shogi, move: JKF.MoveMoveFormat): void;
    static getState(shogi: Shogi): JKF.StateFormat;
    forward(): boolean;
    backward(): boolean;
    goto(tesuu: number): void;
    go(tesuu: number): void;
    forkAndForward(num: number): boolean;
    inputMove(move: JKF.MoveMoveFormat): boolean;
    getBoard(x: number, y: number): ShogiJS.Piece;
    getComments(tesuu?: number): string[];
    getMove(tesuu?: number): JKF.MoveMoveFormat;
    getReadableKifu(tesuu?: number): string;
    getReadableForkKifu(tesuu?: number): string[];
    getMaxTesuu(): number;
    toJKF(): string;
    getState(): JKF.StateFormat;
    getReadableKifuState(): {
        kifu: string;
        forks: string[];
    }[];
    private getMoveFormat(tesuu?);
    private getNextFork(tesuu?);
    private doMove(move);
    private undoMove(move);
    private static sameMoveMinimal(move1, move2);
    private static getBoardState(shogi);
    private static getHandsState(shogi);
}
