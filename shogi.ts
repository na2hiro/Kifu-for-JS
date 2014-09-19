class Shogi{
	static initialBoard = [
		"-KY-KE-GI-KI-OU-KI-GI-KE-KY",
		" * -HI *  *  *  *  * -KA * ",
		"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
		" *  *  *  *  *  *  *  *  * ",
		" *  *  *  *  *  *  *  *  * ",
		" *  *  *  *  *  *  *  *  * ",
		"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
		" * +KA *  *  *  *  * +HI * ",
		"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
	];
	board: Piece[][]; // 盤面
	hands: Piece[][]; // 持ち駒
	constructor(){
		this.initialize();
	}
	// 盤面を平手に初期化する
	initialize(){
		this.board = [];
		for(var i=0; i<9; i++){
			this.board[i]=[];
			for(var j=0; j<9; j++){
				var csa = Shogi.initialBoard[j].slice(24-i*3, 24-i*3+3);
				this.board[i][j] = csa==" * " ? null : new Piece(csa);
			}
		}
		this.hands = [[], []];
	}
	// (fromx, fromy)から(tox, toy)へ移動し，適当な処理を行う．
	move(fromx: number, fromy: number, tox: number, toy: number, promote: boolean = false){
		if(this.get(tox, toy)!=null) this.capture(tox, toy);
		var piece = this.get(fromx, fromy);
		if(promote) piece.promote();
		this.set(tox, toy, piece);
		this.set(fromx, fromy, null);
	}
	// (tox, toy)へcolorの持ち駒のkindを打つ．
	drop(tox: number, toy: number, kind: string, color: Color){
		if(this.get(tox, toy)!=null) throw "there is a piece at "+tox+", "+toy;
		var piece = this.popFromHand(kind, color);
		this.set(tox, toy, piece);
	}
	// CSAによる盤面表現の文字列を返す
	toCSAString(){
		var ret=[];
		for(var y=0; y<9; y++){
			var line = "P"+(y+1);
			for(var x=8; x>=0; x--){
				var piece = this.board[x][y];
				line+= piece==null ? " * " : piece.toCSAString();
			}
			ret.push(line);
		}
		for(var i=0; i<2; i++){
			var line = "P"+"+-"[i];
			for(var j=0; j<this.hands[i].length; j++){
				line+="00"+this.hands[i][j].kind;
			}
			ret.push(line);
		}
		return ret.join("\n");
	}
	// (x, y)の駒の移動可能な動きをすべて得る
	// 盤外，自分の駒取りは除外．二歩，王手放置などはチェックせず．
	getMovesFrom(x: number, y: number):Move[]{
		// 盤外かもしれない(x, y)にcolorの駒が移動しても問題がないか
		var legal = function(x: number, y: number, color: Color){
			if(x<1 || 9<x || y<1 || 9<y) return false;
			var piece = this.get(x, y);
			return piece==null || piece.color!=color;
		}.bind(this);
		var piece = this.get(x, y);
		if(piece==null) return [];
		var moveDef = Piece.getMoveDef(piece.kind);
		var ret = [], from = {x: x, y: y};
		if(moveDef.just){
			for(var i=0; i<moveDef.just.length; i++){
				var def = moveDef.just[i];
				if(piece.color==Color.White){ def[0]*=-1; def[1]*=-1; }
				var to = {x: from.x+def[0], y: from.y+def[1]};
				if(legal(to.x, to.y, piece.color)) ret.push({from: from, to: to});
			}
		}
		if(moveDef.fly){
			for(var i=0; i<moveDef.fly.length; i++){
				var def = moveDef.fly[i];
				if(piece.color==Color.White){ def[0]*=-1; def[1]*=-1; }
				var to = {x: from.x+def[0], y: from.y+def[1]};
				while(legal(to.x, to.y, piece.color)){
					ret.push({from: from, to: {x: to.x, y: to.y}});
					to.x+=def[0];
					to.y+=def[1];
				}
			}
		}
		return ret;
	}
	// colorが打てる動きを全て得る
	getDropsBy(color: Color): Move[]{
		var ret = [];
		var places = [];
		for(var i=1; i<=9; i++){
			for(var j=1; j<=9; j++){
				if(this.get(i, j)==null) places.push({x: i, y: j});
			}
		}
		var done: {[index:string]:boolean} = {};
		for(var i=0; i<this.hands[color].length; i++){
			var kind = this.hands[color][i].kind;
			if(done[kind]) continue;
			done[kind]=true;
			for(var j=0; j<places.length; j++){
				ret.push({to: places[j], color: color, kind: kind});
			}
		}
		return ret;
	}

	// 以下private method

	// (x, y)の駒を得る
	private get(x: number, y: number){
		return this.board[x-1][y-1];
	}
	// (x, y)に駒を置く
	private set(x: number, y: number, piece: Piece){
		this.board[x-1][y-1] = piece;
	}
	// (x, y)の駒を取って反対側の持ち駒に加える
	private capture(x: number, y: number){
		var piece = this.get(x, y);
		this.set(x, y, null);
		piece.unpromote();
		piece.inverse();
		this.pushToHand(piece);
	}
	// 駒pieceを持ち駒に加える
	private pushToHand(piece: Piece){
		this.hands[piece.color].push(piece);
	}
	// color側のkindの駒を取って返す
	private popFromHand(kind: string, color: Color){
		var hand = this.hands[color];
		for(var i=0; i<hand.length; i++){
			if(hand[i].kind!=kind) continue;
			var piece = hand[i];
			hand.splice(i, 1); // remove at i
			return piece;
		}
		throw color+" has no "+kind;
	}
}
interface Move{
	from?: {x: number; y: number;};
	to: {x: number; y: number;};
	kind?: string;
	color?: Color;
}
enum Color {Black, White}
interface MoveDefinition{
	just?: number[][];
	fly?: number[][];
}
// enum Kind {HI, KY, KE, GI, KI, KA, HI, OU, TO, NY, NK, NG, UM, RY}
class Piece{
	color: Color; // 先後
	kind: string; // 駒の種類
	constructor(csa: string){
		this.color = csa.slice(0, 1)=="+" ? Color.Black : Color.White;
		this.kind = csa.slice(1);
	}
	// 成る
	promote(){
		var newKind = Piece.promote(this.kind);
		if(newKind!=null) this.kind = newKind;
	}
	// 不成にする
	unpromote(){
		if(this.isPromoted()) this.kind = Piece.unpromote(this.kind);
	}
	// 駒の向きを反転する
	inverse(){
		this.color = this.color==Color.Black ? Color.White : Color.Black;
	}
	// CSAによる駒表現の文字列を返す
	toCSAString(){
		return (this.color==Color.Black ? "+" : "-")+this.kind;
	}
	// 成った時の種類を返す．なければnull．
	static promote(kind: string){
		return {
			FU: "TO",
			KY: "NY",
			KE: "NK",
			GI: "NG",
			KA: "UM",
			HI: "RY",
		}[kind] || null;
	}
	// 成った時の種類を返す．なければnull．
	static unpromote(kind: string){
		return {
			TO: "FU",
			NY: "KY",
			NK: "KE",
			NG: "GI",
			KI: "KI",
			UM: "KA",
			RY: "HI",
			OU: "OU",
		}[kind] || null;
	}
	static getMoveDef(kind: string): MoveDefinition{
		switch(kind){
			case "FU":
				return {just:[[0,-1],]};
			case "KY":
				return {fly:[[0,-1],]};
			case "KE":
				return {just:[[-1,-2],[1,-2],]};
			case "GI":
				return {just:[[-1,-1],[0,-1],[1,-1],[-1,1],[1,1],]};
			case "KI": case "TO": case "NY": case "NK": case "NG":
				return {just:[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[0,1]]};
			case "KA":
				return {fly:[[-1,-1],[1,-1],[-1,1],[1,1],]};
			case "HI":
				return {fly:[[0,-1],[-1,0],[1,0],[0,1]]};
			case "OU":
				return {just:[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]};
			case "KA":
				return {fly:[[-1,-1],[1,-1],[-1,1],[1,1],],just:[[0,-1],[-1,0],[1,0],[0,1]]};
			case "HI":
				return {fly:[[0,-1],[-1,0],[1,0],[0,1]], just:[[-1,-1],[1,-1],[-1,1],[1,1],]};
		}
	}

	// 以下private method

	// 現在成っているかどうかを返す
	private isPromoted(){
		return ["TO","NY","NK","NG","UM","RY"].indexOf(this.kind)>=0;
	}
}
