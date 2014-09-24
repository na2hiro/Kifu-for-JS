/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />

/** @license
 * Shogi.js
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
	export function normalizeKI2(obj: JSONKifuFormat): JSONKifuFormat{
		throw "not implemented";
	}
	export function normalizeCSA(obj: JSONKifuFormat): JSONKifuFormat{
		throw "not implemented";
	}
}
