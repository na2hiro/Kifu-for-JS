/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
export enum Color {Black, White}
export class Shogi {
	// 既定の初期局面
	static preset: {[index:string]: {board: string[]; turn: Color;}} = {
		"HIRATE": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				" * -HI *  *  *  *  * -KA * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.Black,
		},
		"KY": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE * ",
				" * -HI *  *  *  *  * -KA * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"KY_R": {
			board: [
				" * -KE-GI-KI-OU-KI-GI-KE-KY",
				" * -HI *  *  *  *  * -KA * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"KA": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				" * -HI *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"HI": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				" *  *  *  *  *  *  * -KA * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"HIKY": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE * ",
				" *  *  *  *  *  *  * -KA * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"2": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"3": {
			board: [
				"-KY-KE-GI-KI-OU-KI-GI-KE * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"4": {
			board: [
				" * -KE-GI-KI-OU-KI-GI-KE * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"5": {
			board: [
				" *  * -GI-KI-OU-KI-GI-KE * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"5_L": {
			board: [
				" * -KE-GI-KI-OU-KI-GI *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"6": {
			board: [
				" *  * -GI-KI-OU-KI-GI *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"8": {
			board: [
				" *  *  * -KI-OU-KI *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
		"10": {
			board: [
				" *  *  *  * -OU *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				" *  *  *  *  *  *  *  *  * ",
				"+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				" * +KA *  *  *  *  * +HI * ",
				"+KY+KE+GI+KI+OU+KI+GI+KE+KY",
			],
			turn: Color.White,
		},
	};
	board: Piece[][]; // 盤面
	hands: Piece[][]; // 持ち駒
	turn: Color; // 次の手番
	flagEditMode: boolean; // 編集モードかどうか
	constructor(setting?: SettingType){
		this.initialize(setting);
	}
	// 盤面を初期化する
	// 初期局面(なければ平手)
	initialize(setting: SettingType = {preset: "HIRATE"}): void{
		this.board = [];
		if(setting.preset!="OTHER"){
			for(var i=0; i<9; i++){
				this.board[i]=[];
				for(var j=0; j<9; j++){
					var csa: string = Shogi.preset[setting.preset].board[j].slice(24-i*3, 24-i*3+3);
					this.board[i][j] = csa==" * " ? null : new Piece(csa);
				}
			}
			this.turn = Shogi.preset[setting.preset].turn;
			this.hands = [[], []];
		}else{
			for(var i=0; i<9; i++){
				this.board[i]=[];
				for(var j=0; j<9; j++){
					var p = setting.data.board[i][j];
					this.board[i][j] = p.kind ? new Piece((p.color?"+":":")+p.kind) : null;
				}
			}
			this.turn = setting.data.color ? Color.Black : Color.White;
			this.hands = [[], []];
			for(var c=0; c<2; c++){
				for(var k in setting.data.hands[c]){
					var csa = (c==0?"+":"-")+k;
					for(var i=0; i<setting.data.hands[c][k]; i++){
						this.hands[c].push(new Piece(csa));
					}
				}
			}
		}
		this.flagEditMode = false;
	}
	// 編集モード切り替え
	// * 通常モード：移動時に手番と移動可能かどうかチェックし，移動可能範囲は手番側のみ返す．
	// * 編集モード：移動時に手番や移動可能かはチェックせず，移動可能範囲は両者とも返す．
	editMode(flag: boolean): void{
		this.flagEditMode = flag;
	}

	// (fromx, fromy)から(tox, toy)へ移動し，promoteなら成り，駒を取っていれば持ち駒に加える．．
	move(fromx: number, fromy: number, tox: number, toy: number, promote: boolean = false): void{
		var piece = this.get(fromx, fromy);
		if(piece==null) throw "no piece found at "+fromx+", "+fromy;
		this.checkTurn(piece.color);
		if(!this.flagEditMode){
			if(!this.getMovesFrom(fromx, fromy).some((move)=>{
				return move.to.x==tox && move.to.y==toy;
			})) throw "cannot move from "+fromx+", "+fromy+" to "+tox+", "+toy;
		}
		if(this.get(tox, toy)!=null) this.capture(tox, toy);
		if(promote) piece.promote();
		this.set(tox, toy, piece);
		this.set(fromx, fromy, null);
		this.nextTurn();
	}
	// moveの逆を行う．つまり(tox, toy)から(fromx, fromy)へ移動し，駒を取っていたら戻し，promoteなら成りを戻す．
	unmove(fromx: number, fromy: number, tox: number, toy: number, promote: boolean = false, capture?: string): void{
		var piece = this.get(tox, toy);
		if(piece==null) throw "no piece found at "+tox+", "+toy;
		this.checkTurn(Piece.oppositeColor(piece.color));
		var captured: Piece;
		if(capture){
			captured = this.popFromHand(Piece.unpromote(capture), piece.color);
			captured.inverse();
		}
		var editMode = this.flagEditMode;
		this.editMode(true);
		this.move(tox, toy, fromx, fromy);
		if(promote) piece.unpromote();
		if(capture){
			if(Piece.isPromoted(capture)) captured.promote();
			this.set(tox, toy, captured);
		}
		this.editMode(editMode);
		this.prevTurn();
	}
	// (tox, toy)へcolorの持ち駒のkindを打つ．
	drop(tox: number, toy: number, kind: string, color: Color = this.turn): void{
		this.checkTurn(color);
		if(this.get(tox, toy)!=null) throw "there is a piece at "+tox+", "+toy;
		var piece = this.popFromHand(kind, color);
		this.set(tox, toy, piece);
		this.nextTurn();
	}
	// dropの逆を行う，つまり(tox, toy)の駒を駒台に戻す．
	undrop(tox: number, toy: number): void{
		var piece = this.get(tox, toy);
		if(piece==null) throw "there is no piece at "+tox+", "+toy;
		this.checkTurn(Piece.oppositeColor(piece.color));
		this.pushToHand(piece);
		this.set(tox, toy, null);
		this.prevTurn();
	}
	// CSAによる盤面表現の文字列を返す
	toCSAString(): string{
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
		ret.push(this.turn==Color.Black ? "+" : "-");
		return ret.join("\n");
	}
	// (x, y)の駒の移動可能な動きをすべて得る
	// 盤外，自分の駒取りは除外．二歩，王手放置などはチェックせず．
	getMovesFrom(x: number, y: number): Move[]{
		// 盤外かもしれない(x, y)にcolorの駒が移動しても問題がないか
		var legal = function(x: number, y: number, color: Color){
			if(x<1 || 9<x || y<1 || 9<y) return false;
			var piece = this.get(x, y);
			return piece==null || piece.color!=color;
		}.bind(this);
		var shouldStop = function(x: number, y: number, color: Color){
			var piece = this.get(x, y);
			return piece!=null && piece.color!=color;
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
					if(shouldStop(to.x, to.y, piece.color)) break;
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
	// (x, y)に行けるcolor側のkindの駒の動きを得る
	getMovesTo(x: number, y: number, kind: string, color: Color = this.turn): Move[]{
		var to = {x: x, y: y};
		var ret = [];
		for(var i=1; i<=9; i++){
			for(var j=1; j<=9; j++){
				var piece = this.get(i, j);
				if(!piece || piece.kind!=kind || piece.color!=color) continue;
				var moves = this.getMovesFrom(i, j);
				if(moves.some((move)=>move.to.x==x&&move.to.y==y)){
					ret.push({from: {x: i, y: j}, to: to});
				}
			}
		}
		return ret;
	}
	// (x, y)の駒を得る
	get(x: number, y: number): Piece{
		return this.board[x-1][y-1];
	}
	// keyを種類，valueを枚数とするオブジェクトとして持ち駒の枚数一覧を返す．
	getHandsSummary(color: Color): {[index: string]: number}{
		var ret: {[index: string]: number} = {
			"FU": 0,
			"KY": 0,
			"KE": 0,
			"GI": 0,
			"KI": 0,
			"KA": 0,
			"HI": 0,
		};
		for(var i=0; i<this.hands[color].length; i++){
			ret[this.hands[color][i].kind]++;
		}
		return ret;
	}

	// 以下editModeでの関数

	// (x, y)の駒を取ってcolorの持ち駒に加える
	captureByColor(x: number, y: number, color: Color): void{
		if(!this.flagEditMode) throw "cannot edit board without editMode";
		var piece = this.get(x, y);
		this.set(x, y, null);
		piece.unpromote();
		if(piece.color!=color) piece.inverse();
		this.pushToHand(piece);
	}
	// (x, y)の駒をフリップする(先手→先手成→後手→後手成→)
	// 成功したらtrueを返す
	flip(x: number, y: number): boolean{
		if(!this.flagEditMode) throw "cannot edit board without editMode";
		var piece = this.get(x, y);
		if(!piece) return false;
		if(Piece.isPromoted(piece.kind)){
			piece.unpromote();
			piece.inverse();
		}else if(Piece.canPromote(piece.kind)){
			piece.promote();
		}else{
			piece.inverse();
		}
		return true;
	}
	// 手番を設定する
	setTurn(color: Color): void{
		if(!this.flagEditMode) throw "cannot set turn without editMode";
		this.turn = color;
	}

	// 以下private method

	// (x, y)に駒を置く
	private set(x: number, y: number, piece: Piece): void{
		this.board[x-1][y-1] = piece;
	}
	// (x, y)の駒を取って反対側の持ち駒に加える
	private capture(x: number, y: number): void{
		var piece = this.get(x, y);
		this.set(x, y, null);
		piece.unpromote();
		piece.inverse();
		this.pushToHand(piece);
	}
	// 駒pieceを持ち駒に加える
	private pushToHand(piece: Piece): void{
		this.hands[piece.color].push(piece);
	}
	// color側のkindの駒を取って返す
	private popFromHand(kind: string, color: Color): Piece{
		var hand = this.hands[color];
		for(var i=0; i<hand.length; i++){
			if(hand[i].kind!=kind) continue;
			var piece = hand[i];
			hand.splice(i, 1); // remove at i
			return piece;
		}
		throw color+" has no "+kind;
	}
	// 次の手番に行く
	private nextTurn(): void{
		if(this.flagEditMode) return;
		this.turn = this.turn==Color.Black ? Color.White : Color.Black;
	}
	// 前の手番に行く
	private prevTurn(): void{
		if(this.flagEditMode) return;
		this.nextTurn();
	}
	// colorの手番で問題ないか確認する．編集モードならok．
	private checkTurn(color: Color): void{
		if(!this.flagEditMode && color!=this.turn) throw "cannot move opposite piece";
	}
}
export interface SettingType {
	preset: string;
	data?: {
		color: boolean;
		board: { color?: boolean; kind?: boolean; }[][];
		hands: {[index:string]: number}[];
	}
}
export interface Move{
	from?: {x: number; y: number;};
	to: {x: number; y: number;};
	kind?: string;
	color?: Color;
}
export interface MoveDefinition{
	just?: number[][];
	fly?: number[][];
}
// enum Kind {HI, KY, KE, GI, KI, KA, HI, OU, TO, NY, NK, NG, UM, RY}
export class Piece{
	color: Color; // 先後
	kind: string; // 駒の種類
	// "+FU"などのCSAによる駒表現から駒オブジェクトを作成
	constructor(csa: string){
		this.color = csa.slice(0, 1)=="+" ? Color.Black : Color.White;
		this.kind = csa.slice(1);
	}
	// 成る
	promote(): void{
		this.kind = Piece.promote(this.kind);
	}
	// 不成にする
	unpromote(): void{
		this.kind = Piece.unpromote(this.kind);
	}
	// 駒の向きを反転する
	inverse(): void{
		this.color = this.color==Color.Black ? Color.White : Color.Black;
	}
	// CSAによる駒表現の文字列を返す
	toCSAString(): string{
		return (this.color==Color.Black ? "+" : "-")+this.kind;
	}
	// 成った時の種類を返す．なければそのまま．
	static promote(kind: string): string{
		return {
			FU: "TO",
			KY: "NY",
			KE: "NK",
			GI: "NG",
			KA: "UM",
			HI: "RY",
		}[kind] || kind;
	}
	// 表に返した時の種類を返す．表の場合はそのまま．
	static unpromote(kind: string): string{
		return {
			TO: "FU",
			NY: "KY",
			NK: "KE",
			NG: "GI",
			KI: "KI",
			UM: "KA",
			RY: "HI",
			OU: "OU",
		}[kind] || kind;
	}
	// 成れる駒かどうかを返す
	static canPromote(kind: string): boolean{
		return Piece.promote(kind)!=kind;
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
			case "UM":
				return {fly:[[-1,-1],[1,-1],[-1,1],[1,1],],just:[[0,-1],[-1,0],[1,0],[0,1]]};
			case "RY":
				return {fly:[[0,-1],[-1,0],[1,0],[0,1]], just:[[-1,-1],[1,-1],[-1,1],[1,1],]};
		}
	}
	static isPromoted(kind: string): boolean{
		return ["TO","NY","NK","NG","UM","RY"].indexOf(kind)>=0;
	}
	static oppositeColor(color: Color): Color{
		return color==Color.Black ? Color.White : Color.Black;
	}
}
