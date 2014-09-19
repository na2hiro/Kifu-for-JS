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
		this.hands[piece.color==Color.Black?0:1].push(piece);
	}
	// color側のkindの駒を取って返す
	private popFromHand(kind: string, color: Color){
		var hand = this.hands[color==Color.Black?0:1];
		for(var i=0; i<hand.length; i++){
			if(hand[i].kind!=kind) continue;
			var piece = hand[i];
			hand.splice(i, 1); // remove at i
			return piece;
		}
		throw color+" has no "+kind;
	}
}
enum Color {Black, White}
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
	// 以下private method

	// 現在成っているかどうかを返す
	private isPromoted(){
		return ["TO","NY","NK","NG","UM","RY"].indexOf(this.kind)>=0;
	}
}
