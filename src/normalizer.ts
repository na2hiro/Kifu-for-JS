/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />

/** @license
 * JSON Kifu Format 
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Normalizer{
	function canPromote(place: PlaceFormat, color: Color){
		return color==Color.Black ? place.y<=3 : place.y>=7;
	}

	export function normalize(obj: JSONKifuFormat): JSONKifuFormat{
		switch(obj.type){
			case "normal":
				return obj;
			case "kif":
				return normalizeKIF(obj);
	/*
			case "ki2":
				normalizeKI2(obj);
				break;
			case "csa":
				normalizeCSA(obj);
				break;
	*/
			default:
				throw "not supported";
		}
	}

	export function normalizeKIF(obj: JSONKifuFormat): JSONKifuFormat{
		var shogi = new Shogi();
		for(var i=0; i<obj.moves.length; i++){
			var move = obj.moves[i].move;
			if(!move) continue;
			console.log(i, move);
			if(move.from){
				// move
				if(move.same) move.to = obj.moves[i-1].move.to;
				var to = shogi.get(move.to.x, move.to.y);
				if(to) move.capture = to.kind;
				if(!move.promote && !Piece.isPromoted(move.piece)){
					// 成ってない
					if(canPromote(move.to, shogi.turn) || canPromote(move.from, shogi.turn)){
						move.promote=false;
					}
				}
				var moveVectors = shogi.getMovesTo(move.to.x, move.to.y, move.piece).map((mv)=>flipVector(shogi.turn, spaceshipVector(mv.to, mv.from)));
				if(moveVectors.length>=2){
					var realVector = flipVector(shogi.turn, spaceshipVector(move.to, move.from));
					move.relative = function(){
						// 上下方向唯一
						if(moveVectors.filter((mv)=>mv.y==realVector.y).length==1) return YToUMD(realVector.y);
						// 左右方向唯一
						if(moveVectors.filter((mv)=>mv.x==realVector.x).length==1){
							if((move.piece=="UM" || move.piece=="RY") && realVector.x==0){
								//直はだめ
								return XToLCR(moveVectors.filter((mv)=>mv.x<0).length==0 ? -1 : 1);
							}else{
								return XToLCR(realVector.x);
							}
						}
						//上下も左右も他の駒がいる
						return XToLCR(realVector.x)+YToUMD(realVector.y);
					}();
				}

				try{
					shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
				}catch(e){
					console.log(i, "手目で失敗しました", e);
				}
			}else{
				// drop
				if(shogi.getMovesTo(move.to.x, move.to.y, move.piece).length>0){
					move.relative="H";
				}
				shogi.drop(move.to.x, move.to.y, move.piece);
			}
		}
		return obj;
	}
	export function normalizeKI2(obj: JSONKifuFormat): JSONKifuFormat{
		var shogi = new Shogi();
		for(var i=0; i<obj.moves.length; i++){
			var move = obj.moves[i].move;
			if(!move) continue;
			console.log(i, move);
			if(move.same) move.to = obj.moves[i-1].move.to;
			// from特定
			var moves = shogi.getMovesTo(move.to.x, move.to.y, move.piece);
			if(move.relative=="H" || moves.length==0){
				// ok
			}else if(moves.length==1){
				move.from = moves[0].from;
			}else{
				// 相対逆算
				var moveAns = filterMovesByRelatives(move.relative, shogi.turn, moves);
				if(moveAns.length!=1) throw "相対情報が不完全で複数の候補があります";
				move.from = moveAns[0].from;
			}
			if(move.from){
				// move
				var to = shogi.get(move.to.x, move.to.y);
				if(to) move.capture = to.kind;

				try{
					shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
				}catch(e){
					console.log(i, "手目で失敗しました", e);
				}
			}else{
				// drop
				shogi.drop(move.to.x, move.to.y, move.piece);
			}
		}
		return obj;
	}
	export function normalizeCSA(obj: JSONKifuFormat): JSONKifuFormat{
		throw "not implemented";
	}
	function flipVector(color: Color, vector: {x: number; y: number;}){
		return color==Color.Black ? vector : {x: -vector.x, y: -vector.y};
	}
	function spaceship(a: number, b: number){
		return a==b ? 0 : (a>b ? 1 : -1);
	}
	function spaceshipVector(a: {x: number; y: number;}, b: {x: number; y: number;}){
		return {x: spaceship(a.x, b.x), y: spaceship(a.y, b.y)};
	}
	// yの段から移動した場合の相対情報
	function YToUMD(y: number){
		return y==0 ? "M" : (y>0 ? "D" : "U");
	}
	// xの行から移動した場合の相対情報
	function XToLCR(x: number){
		return x==0 ? "C" : (x>0 ? "R" : "L");
	}
	function filterMovesByRelatives(relative: string, color: Color, moves: Move[]): Move[]{
		var ret=[];
		for(var i=0; i<moves.length; i++){
			if(relative.split("").every((rel)=>moveSatisfiesRelative(rel, color, moves[i]))){
				ret.push(moves[i]);
			}
		}
		return ret;
	}
	function moveSatisfiesRelative(relative: string, color: Color, move: Move): boolean{
		var vec = flipVector(color, {x: move.to.x-move.from.x, y: move.to.y-move.from.y});
		switch(relative){
			case "U":
				return vec.y<0;
			case "M":
				return vec.y==0;
			case "D":
				return vec.y>0;
			case "L":
				return vec.x<0;
			case "C":
				return vec.x==0;
			case "R":
				return vec.x>0;
		}
	}
}
