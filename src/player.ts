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
	static numToZen(n: number){
		return "０１２３４５６７８９"[n];
	}
	static numToKan(n: number){
		return "〇一二三四五六七八九"[n];
	}
	static kindToKan(kind: string): string{
		return {
			"FU": "歩",
			"KY": "香",
			"KE": "桂",
			"GI": "銀",
			"KI": "金",
			"KA": "角",
			"HI": "飛",
			"OU": "玉",
			"TO": "と",
			"NY": "成香",
			"NK": "成桂",
			"NG": "成銀",
			"UM": "馬",
			"RY": "龍",
		}[kind];
	}
	static relativeToKan(relative: string){
		return {
			"L": "左",
			"C": "直",
			"R": "右",
			"U": "上",
			"M": "寄",
			"D": "引",
			"H": "打",
		}[relative];
	}
	static specialToKan(special: string){
		return {
			"TORYO": "投了",
		}[special];
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
	getComments(tesuu: number = this.tesuu){
		return this.kifu.moves[tesuu].comments;
	}
	getMove(tesuu: number = this.tesuu){
		return this.kifu.moves[tesuu].move;
	}
	getReadableKifu(tesuu: number = this.tesuu){
		if(tesuu==0) return "開始局面";
		if(this.kifu.moves[tesuu].special){
			return JKFPlayer.specialToKan(this.kifu.moves[tesuu].special);
		}
		var move = this.kifu.moves[tesuu].move;
		var ret = this.getMoveTurn(tesuu)==Color.Black ? "☗" : "☖";
		if(move.same){
			ret+="同　";
		}else{
			ret+=JKFPlayer.numToZen(move.to.x)+JKFPlayer.numToKan(move.to.y);
		}
		ret+=JKFPlayer.kindToKan(move.piece);
		if(move.relative){
			ret+=move.relative.split("").map(JKFPlayer.relativeToKan).join("");
		}
		if(move.promote!=null){
			ret+=move.promote ? "成" : "不成";
		}
		return ret;
	}
	getMoveTurn(tesuu: number){
		return tesuu%2==1 ? Color.Black : Color.White;
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
