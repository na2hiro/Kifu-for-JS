/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import {Color} from "shogi.js";
export default interface IJSONKifuFormat {
    header: {[index: string]: string; };
    initial?: {
        preset: string;
        data?: IStateFormat;
    };
    moves: IMoveFormat[];
}
// 盤面
export interface IStateFormat {
    color: Color;
    board: Array<Array<{ color?: Color; kind?: string; }>>;
    hands: Array<{[index: string]: number}>;
}
// 動作
export interface IMoveMoveFormat {
    color: Color;
    from?: IPlaceFormat;
    to?: IPlaceFormat;
    piece: string;
    same?: boolean;
    promote?: boolean;
    capture?: string;
    relative?: string;
}
// 棋譜(一手)
export interface IMoveFormat {
    comments?: string[];
    move?: IMoveMoveFormat;
    time?: {
        now: ITimeFormat;
        total: ITimeFormat;
    };
    special?: string;
    forks?: IMoveFormat[][];
}
// 時間
export interface ITimeFormat {
    h?: number;
    m: number;
    s: number;
}
// 座標
export interface IPlaceFormat {
    x: number;
    y: number;
}
