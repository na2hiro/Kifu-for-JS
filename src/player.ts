/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />
/// <reference path="./normalizer.ts" />

class JKFPlayer{
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
	static parseKIF(kifu: string){
		if(!JKFPlayer.kifParser) throw "パーサが読み込まれていません";
		return new JKFPlayer(Normalizer.normalizeKIF(JKFPlayer.kifParser.parse(kifu)));
	}
	static parseKI2(kifu: string){
		if(!JKFPlayer.ki2Parser) throw "パーサが読み込まれていません";
		return new JKFPlayer(Normalizer.normalizeKI2(JKFPlayer.ki2Parser.parse(kifu)));
	}
	static parseCSA(kifu: string){
		if(!JKFPlayer.csaParser) throw "パーサが読み込まれていません";
		return new JKFPlayer(Normalizer.normalizeCSA(JKFPlayer.csaParser.parse(kifu)));
	}
	static kifParser: {parse: (kifu: string)=>JSONKifuFormat};
	static ki2Parser: {parse: (kifu: string)=>JSONKifuFormat};
	static csaParser: {parse: (kifu: string)=>JSONKifuFormat};

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
	goto(tesuu: number){
		var limit = 10000; // for safe
		if(this.tesuu<tesuu){
			while(this.tesuu!=tesuu && this.forward() && limit-->0);
		}else{
			while(this.tesuu!=tesuu && this.backward() && limit-->0);
		}
		if(limit==0) throw "tesuu overflows";
	}
	go(tesuu: number){
		this.goto(this.tesuu+tesuu);
	}
	// wrapper
	getBoard(x: number, y: number){
		return this.shogi.get(x, y);
	}
	getHandsSummary(color: Color){
		return this.shogi.getHandsSummary(color);
	}
	getNowComments(){
		return this.kifu.moves[this.tesuu].comments;
	}

	// private

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
