/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import ShogiJS = require('../node_modules/shogi.js/lib/shogi');
import Color = ShogiJS.Color;
import Piece = ShogiJS.Piece;
import Shogi = ShogiJS.Shogi;
import Normalizer = require('./normalizer');
import kifParser = require("../out/kif-parser");
import ki2Parser = require("../out/ki2-parser");
import csaParser = require("../out/csa-parser");
import JKF = require('./JSONKifuFormat');

export = JKFPlayer;

class JKFPlayer{
	shogi: Shogi;
	kifu: JKF.JSONKifuFormat;
	tesuu: number;
	forks: {te: number; moves: JKF.MoveFormat[]}[];
	static debug = false;
	static _log = [];
	static log(...lg: any[]){
		if(JKFPlayer.debug){
			console.log(lg);
		}else{
			JKFPlayer._log.push(lg);
		}
	}
	constructor(kifu: JKF.JSONKifuFormat){
		this.shogi = new Shogi(kifu.initial || undefined);
		this.initialize(kifu);
	}
	initialize(kifu: JKF.JSONKifuFormat){
		this.kifu = kifu;
		this.tesuu = 0;
		this.forks = [{te: 0, moves: this.kifu.moves}];
	}
	static parse(kifu: string, filename?: string){
		if(filename){
			var tmp = filename.split("."), ext = tmp[tmp.length-1].toLowerCase();
			switch(ext){
				case "jkf":
					return JKFPlayer.parseJKF(kifu);
				case "kif": case "kifu":
					return JKFPlayer.parseKIF(kifu);
				case "ki2": case "ki2u":
					return JKFPlayer.parseKI2(kifu);
				case "csa":
					return JKFPlayer.parseCSA(kifu);
			}
		}
		// 不明
		try{
			return JKFPlayer.parseJKF(kifu);
		}catch(e){
			JKFPlayer.log("failed to parse as jkf", e);
		}
		try{
			return JKFPlayer.parseKIF(kifu);
		}catch(e){
			JKFPlayer.log("failed to parse as kif", e);
		}
		try{
			return JKFPlayer.parseKI2(kifu);
		}catch(e){
			JKFPlayer.log("failed to parse as ki2", e);
		}
		try{
			return JKFPlayer.parseCSA(kifu);
		}catch(e){
			JKFPlayer.log("failed to parse as csa", e);
		}
		throw "JKF, KIF, KI2, CSAいずれの形式でも失敗しました";
	}
	static parseJKF(kifu: string){
		JKFPlayer.log("parseJKF", kifu);
		return new JKFPlayer(JSON.parse(kifu));
	}
	static parseKIF(kifu: string){
		JKFPlayer.log("parseKIF", kifu);
		return new JKFPlayer(Normalizer.normalizeKIF(kifParser.parse(kifu)));
	}
	static parseKI2(kifu: string){
		JKFPlayer.log("parseKI2", kifu);
		return new JKFPlayer(Normalizer.normalizeKI2(ki2Parser.parse(kifu)));
	}
	static parseCSA(kifu: string){
		JKFPlayer.log("parseCSA", kifu);
		return new JKFPlayer(Normalizer.normalizeCSA(csaParser.parse(kifu)));
	}
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
			"CHUDAN": "中断",
			"SENNICHITE": "千日手",
			"TIME_UP": "時間切れ",
			"ILLEGAL_MOVE": "反則負け",
			"+ILLEGAL_ACTION": "後手反則負け",
			"-ILLEGAL_ACTION": "先手反則負け",
			"JISHOGI": "持将棋",
			"KACHI": "勝ち宣言",
			"HIKIWAKE": "引き分け宣言",
			"MATTA": "待った",
			"TSUMI": "詰",
			"FUZUMI": "不詰",
			"ERROR": "エラー",
		}[special] || special;
	}
	static moveToReadableKifu(mv: JKF.MoveFormat): string{
		if(mv.special){
			return JKFPlayer.specialToKan(mv.special);
		}
		var move = mv.move;
		var ret = move.color==Color.Black ? "☗" : "☖";
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
	static doMove(shogi: Shogi, move: JKF.MoveMoveFormat){
		if(!move) return;
		if(move.from){
			shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
		}else{
			shogi.drop(move.to.x, move.to.y, move.piece, typeof move.color != "undefined" ? move.color : void 0);
		}
	}
	static undoMove(shogi: Shogi, move: JKF.MoveMoveFormat){
		if(!move) return;
		if(move.from){
			shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
		}else{
			shogi.undrop(move.to.x, move.to.y);
		}
	}
	static getState(shogi: Shogi): JKF.StateFormat{
		return {
			color: shogi.turn,
			board: JKFPlayer.getBoardState(shogi),
			hands: JKFPlayer.getHandsState(shogi),
		};
	}
	// 1手進める
	forward(){
		if(!this.getMoveFormat(this.tesuu+1)) return false;
		this.tesuu++;
		var move = this.getMoveFormat(this.tesuu).move;
		if(!move) return true;
		JKFPlayer.log("forward", this.tesuu, move);
		this.doMove(move);
		return true;
	}
	// 1手戻す
	backward(){
		if(this.tesuu<=0) return false;
		var move = this.getMoveFormat(this.tesuu).move;
		JKFPlayer.log("backward", this.tesuu-1, move);
		this.undoMove(move);
		this.tesuu--;
		this.forks = this.forks.filter((fork)=>fork.te<=this.tesuu);
		return true;
	}
	// tesuu手目へ行く
	goto(tesuu: number){
		var limit = 10000; // for safe
		if(this.tesuu<tesuu){
			while(this.tesuu!=tesuu && this.forward() && limit-->0);
		}else{
			while(this.tesuu!=tesuu && this.backward() && limit-->0);
		}
		if(limit==0) throw "tesuu overflows";
	}
	// tesuu手前後に移動する
	go(tesuu: number){
		this.goto(this.tesuu+tesuu);
	}
	// 現在の局面から別れた分岐のうちnum番目の変化へ1つ進む
	forkAndForward(num: number): boolean{
		var forks = this.getMoveFormat(this.tesuu+1).forks;
		if(!forks || forks.length<=num) return false;
		this.forks.push({te: this.tesuu+1, moves: forks[num]});
		return this.forward();
	}
	// 現在の局面から新しいかもしれない手を1手動かす．
	// 必要フィールドは，指し: from, to, promote(成れる場合のみ)．打ち: to, piece
	// 新しい手の場合，最終手であれば手を追加，そうでなければ分岐を追加
	// もしpromoteの可能性があればfalseを返して何もしない
	// 成功すればその局面に移動してtrueを返す．
	inputMove(move: JKF.MoveMoveFormat){
		if(this.getMoveFormat().special) throw "終了局面へ棋譜を追加することは出来ません";
		if(move.from!=null && move.promote==null){
			var piece = this.shogi.get(move.from.x, move.from.y);
			if(!Piece.isPromoted(piece.kind) && Piece.canPromote(piece.kind) && (Normalizer.canPromote(move.from, piece.color) || Normalizer.canPromote(move.to, piece.color))) return false;
		}
		var nextMove = this.getMoveFormat(this.tesuu+1);
		if(nextMove){
			if(nextMove.move && JKFPlayer.sameMoveMinimal(nextMove.move, move)){
				// 次の一手と一致
				this.forward();
				return true;
			}
			if(nextMove.forks){
				for(var i=0; i<nextMove.forks.length; i++){
					var forkCand = nextMove.forks[i][0];
					if(forkCand && forkCand.move && JKFPlayer.sameMoveMinimal(forkCand.move, move)){
						// 分岐と一致
						this.forkAndForward(i);
						return true;
					}
				}
			}
		}
		this.doMove(move); //動かしてみる(throwされうる)
		var newMove = {move: move};
		var addToFork = this.tesuu < this.getMaxTesuu();
		if(addToFork){
			// 最終手でなければ分岐に追加
			var next = this.getMoveFormat(this.tesuu+1);
			if(!next.forks) next.forks = [];
			next.forks.push([newMove]);
		}else{
			// 最終手に追加
			this.forks[this.forks.length-1].moves.push(newMove);
		}
		Normalizer.normalizeMinimal(this.kifu); // 復元
		this.undoMove(move);
		// 考え改めて再生
		if(addToFork){
			this.forkAndForward(next.forks.length-1);
		}else{
			this.forward();
		}
		return true;
	}
	// wrapper
	getBoard(x: number, y: number){
		return this.shogi.get(x, y);
	}
	getComments(tesuu: number = this.tesuu){
		return this.getMoveFormat(tesuu).comments || [];
	}
	getMove(tesuu: number = this.tesuu){
		return this.getMoveFormat(tesuu).move;
	}
	getReadableKifu(tesuu: number = this.tesuu): string{
		if(tesuu==0) return "開始局面";
		return JKFPlayer.moveToReadableKifu(this.getMoveFormat(tesuu));
	}
	getReadableForkKifu(tesuu: number = this.tesuu): string[]{
		return this.getNextFork(tesuu).map((fork)=>JKFPlayer.moveToReadableKifu(fork[0]));
	}
	getMaxTesuu(){
		var nearestFork = this.forks[this.forks.length-1];
		return nearestFork.te+nearestFork.moves.length-1;
	}
	toJKF(){
		return JSON.stringify(this.kifu);
	}
	// jkf.initial.dataの形式を得る
	getState(){
		return JKFPlayer.getState(this.shogi);
	}
	getReadableKifuState(): {kifu:string; forks:string[]}[]{
		var ret = [];
		for(var i=0; i<=this.getMaxTesuu(); i++){
			ret.push({kifu: this.getReadableKifu(i), forks: this.getReadableForkKifu(i-1), comments: this.getComments(i)});
		}
		return ret;
	}

	// private

	// 現在の局面から分岐を遡った初手から，現在の局面からの本譜の中から棋譜を得る
	private getMoveFormat(tesuu: number = this.tesuu): JKF.MoveFormat{
		for(var i=this.forks.length-1; i>=0; i--){
			var fork = this.forks[i];
			if(fork.te<=tesuu){
				return fork.moves[tesuu-fork.te];
			}
		}
		throw "指定した手数が異常です";
	}
	private getNextFork(tesuu: number = this.tesuu){
		var next = this.getMoveFormat(tesuu+1);
		return (next && next.forks) ? next.forks : [];
	}
	private doMove(move: JKF.MoveMoveFormat){
		JKFPlayer.doMove(this.shogi, move);
	}
	private undoMove(move: JKF.MoveMoveFormat){
		JKFPlayer.undoMove(this.shogi, move);
	}
	private static sameMoveMinimal(move1: JKF.MoveMoveFormat, move2: JKF.MoveMoveFormat){
		return (move1.to.x==move2.to.x && move1.to.y==move2.to.y
						&& (move1.from
							? move1.from.x==move2.from.x && move1.from.y==move2.from.y && move1.promote==move2.promote
							: move1.piece==move2.piece ));
	}
	private static getBoardState(shogi: Shogi){
		var ret = [];
		for(var i=1; i<=9; i++){
			var arr = [];
			for(var j=1; j<=9; j++){
				var piece = shogi.get(i, j);
				arr.push(piece ? {color: piece.color, kind: piece.kind} : {});
			}
			ret.push(arr);
		}
		return ret;
	}
	private static getHandsState(shogi: Shogi){
		return [
			shogi.getHandsSummary(Color.Black),
			shogi.getHandsSummary(Color.White),
		];
	}
}
