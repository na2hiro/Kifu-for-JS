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
		data?: {
			color: boolean;
			board: { color?: boolean; kind?: boolean; }[][];
			hands: {[index:string]: number}[];
		}
	};
	moves: MoveFormat[];
}
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
interface MoveFormat{
	comments?: string[];
	move?: MoveMoveFormat;
	time?: {
		now: TimeFormat;
		total: TimeFormat;
	}
	special?: string;
	fork?: MoveFormat[][];
}
interface TimeFormat{
	h?: number;
	m: number;
	s: number;
}
interface PlaceFormat{
	x: number;
	y: number;
}
