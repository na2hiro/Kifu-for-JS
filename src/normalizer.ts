/// <reference path="../Shogi.js/src/shogi.ts" />

interface JSONKifuFormat{
	type: string;
	header: {[index: string]: string;};
	moves: MoveFormat[];
	result: string;
}
interface MoveFormat{
	comments: string[];
	move: {
		from?: PlaceFormat;
		to?: PlaceFormat;
		piece: string;
		same?: boolean;
		promote?: boolean;
		capture?: string;
	};
	time: {
		now: TimeFormat;
		total: TimeFormat;
	}
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

function canPromote(place: PlaceFormat, color: Color){
	return color==Color.Black ? place.y<=3 : place.y>=7;
}

function normalizeKIF(obj: JSONKifuFormat){
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
}
