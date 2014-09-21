/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />

class Player{
	shogi: Shogi;
	kifu: JSONKifuFormat;
	tesuu: number;
	constructor(kifu: JSONKifuFormat){
		this.shogi = new Shogi();
		this.initialize(kifu);
	}
	initialize(kifu: JSONKifuFormat){
		this.kifu = kifu;
		this.tesuu = 0;
	}
	forward(){
		if(this.tesuu+1>=this.kifu.moves.length) return false;
		this.tesuu++;
		var move = this.kifu.moves[this.tesuu].move;
		if(!move) return true;
		console.log("forward", this.tesuu, move);
		this.doMove(move);
		return true;
	}
	backward(){
		if(this.tesuu<=0) return false;
		var move = this.kifu.moves[this.tesuu].move;
		if(!move){ this.tesuu--; return true; }
		console.log("backward", this.tesuu-1, move);
		this.undoMove(move);
		this.tesuu--;
		return true;
	}

	private doMove(move: MoveMoveFormat){
		if(move.from){
			this.shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
		}else{
			this.shogi.drop(move.to.x, move.to.y, move.piece);
		}
	}
	private undoMove(move: MoveMoveFormat){
		if(move.from){
			this.shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
		}else{
			this.shogi.undrop(move.to.x, move.to.y);
		}
	}
}
