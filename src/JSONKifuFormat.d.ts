/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
 import ShogiJS = require("shogi.js/lib/shogi");
 import Color = ShogiJS.Color;
export interface JSONKifuFormat{
	header: {[index: string]: string;};
	initial?: {
		preset: string;
		data?: StateFormat;
	};
	moves: MoveFormat[];
}
// 盤面
export interface StateFormat{
	color: Color;
	board: { color?: Color; kind?: string; }[][];
	hands: {[index:string]: number}[];
}
// 動作
export interface MoveMoveFormat {
	color: Color;
	from?: PlaceFormat;
	to?: PlaceFormat;
	piece: string;
	same?: boolean;
	promote?: boolean;
	capture?: string;
	relative?: string;
}
// 棋譜(一手)
export interface MoveFormat{
	comments?: string[];
	move?: MoveMoveFormat;
	time?: {
		now: TimeFormat;
		total: TimeFormat;
	}
	special?: string;
	forks?: MoveFormat[][];
}
// 時間
export interface TimeFormat{
	h?: number;
	m: number;
	s: number;
}
// 座標
export interface PlaceFormat{
	x: number;
	y: number;
}
