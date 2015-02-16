/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
interface JSONKifuFormat{
	header: {[index: string]: string;};
	initial?: {
		preset: string;
		data?: StateFormat;
	};
	moves: MoveFormat[];
}
// 盤面
interface StateFormat{
	color: boolean;
	board: { color?: boolean; kind?: boolean; }[][];
	hands: {[index:string]: number}[];
}
// 動作
interface MoveMoveFormat {
	color: boolean;
	from?: PlaceFormat;
	to?: PlaceFormat;
	piece: string;
	same?: boolean;
	promote?: boolean;
	capture?: string;
	relative?: string;
}
// 棋譜(一手)
interface MoveFormat{
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
interface TimeFormat{
	h?: number;
	m: number;
	s: number;
}
// 座標
interface PlaceFormat{
	x: number;
	y: number;
}
