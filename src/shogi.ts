/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import Color from "./Color";
import {MOVE_DEF} from "./Constants";
import IMoveDefinition from "./IMoveDefinition";
import {Kind} from "./Kind";
import Piece from "./Piece";
import "./polyfills";
import {fromPreset, fromSfen, toCSA, toSfen} from "./Serialization";

/**
 * 将棋盤を管理するクラス
 */
export class Shogi {
    private static getIllegalUnpromotedRow(kind: Kind) {
        switch (kind) {
            case "FU":
            case "KY":
                return 1;
            case "KE":
                return 2;
            default:
                return 0;
        }
    }

    /**
     * 手番の相手側から数えた段数
     */
    private static getRowToOppositeEnd(y: number, color: Color) {
        return color === Color.Black ? y : 10 - y;
    }

    /**
     * 盤面
     */
    public board: Piece[][];
    /**
     * 持ち駒
     */
    public hands: Piece[][];
    /**
     * 次の手番
     */
    public turn: Color;
    /**
     * 編集モードかどうか
     */
    public flagEditMode: boolean;
    constructor(setting?: ISettingType) {
        this.initialize(setting);
    }

    /**
     * 盤面を初期化する
     * @param {ISettingType} setting 初期局面(なければ平手)
     */
    public initialize(setting: ISettingType = {preset: "HIRATE"}): void {
        fromPreset(this, setting);
        this.flagEditMode = false;
    }

    /**
     * SFENによる盤面表現の文字列で盤面を初期化する
     * @param {string} sfen
     */
    public initializeFromSFENString(sfen: string): void {
        fromSfen(this, sfen);
    }

    /**
     * CSAによる盤面表現の文字列を返す
     * @returns {string}
     */
    public toCSAString(): string {
        return toCSA(this);
    }

    /**
     * SFENによる盤面表現の文字列を返す
     * @param {number} moveCount
     * @returns {string}
     */
    public toSFENString(moveCount = 1): string {
        return toSfen(this, moveCount);
    }

    /**
     * 編集モード切り替え
     * * 通常モード：移動時に手番と移動可能かどうかチェックし，移動可能範囲は手番側のみ返す．
     * * 編集モード：移動時に手番や移動可能かはチェックせず，移動可能範囲は両者とも返す．
     */
    public editMode(flag: boolean): void {
        this.flagEditMode = flag;
    }

    /**
     * (fromx, fromy)から(tox, toy)へ移動し，promoteなら成り，駒を取っていれば持ち駒に加える．．
     */
    public move(fromx: number, fromy: number, tox: number, toy: number, promote = false): void {
        const piece = this.get(fromx, fromy);
        if (piece == null) {
            throw new Error("no piece found at " + fromx + ", " + fromy);
        }
        this.checkTurn(piece.color);
        if (!this.flagEditMode) {
            if (
                !this.getMovesFrom(fromx, fromy).some((move) => {
                    return move.to.x === tox && move.to.y === toy;
                })
            ) {
                throw new Error(
                    "cannot move from " + fromx + ", " + fromy + " to " + tox + ", " + toy
                );
            }
        }
        if (this.get(tox, toy) != null) {
            this.capture(tox, toy);
        }
        // 行き所のない駒
        const deadEnd =
            Shogi.getIllegalUnpromotedRow(piece.kind) >=
            Shogi.getRowToOppositeEnd(toy, piece.color);
        if (promote || deadEnd) {
            piece.promote();
        }
        this.set(tox, toy, piece);
        this.set(fromx, fromy, null);
        this.nextTurn();
    }

    /**
     * moveの逆を行う．つまり(tox, toy)から(fromx, fromy)へ移動し，駒を取っていたら戻し，promoteなら成りを戻す．
     */
    public unmove(
        fromx: number,
        fromy: number,
        tox: number,
        toy: number,
        promote = false,
        capture?: Kind
    ): void {
        const piece = this.get(tox, toy);
        if (piece == null) {
            throw new Error("no piece found at " + tox + ", " + toy);
        }
        this.checkTurn(Piece.oppositeColor(piece.color));
        let captured: Piece;
        if (capture) {
            captured = this.popFromHand(Piece.unpromote(capture), piece.color);
            captured.inverse();
        }
        const editMode = this.flagEditMode;
        this.editMode(true);
        this.move(tox, toy, fromx, fromy);
        if (promote) {
            piece.unpromote();
        }
        if (capture) {
            if (Piece.isPromoted(capture)) {
                captured.promote();
            }
            this.set(tox, toy, captured);
        }
        this.editMode(editMode);
        this.prevTurn();
    }

    /**
     * (tox, toy)へcolorの持ち駒のkindを打つ．
     */
    public drop(tox: number, toy: number, kind: Kind, color: Color = this.turn): void {
        this.checkTurn(color);
        if (this.get(tox, toy) != null) {
            throw new Error("there is a piece at " + tox + ", " + toy);
        }
        if (
            !this.getDropsBy(color).some((move: IMove) => {
                return move.to.x === tox && move.to.y === toy && move.kind === kind;
            })
        ) {
            throw new Error("Cannot move");
        }
        const piece = this.popFromHand(kind, color);
        this.set(tox, toy, piece);
        this.nextTurn();
    }

    /**
     * dropの逆を行う，つまり(tox, toy)の駒を駒台に戻す．
     */
    public undrop(tox: number, toy: number): void {
        const piece = this.get(tox, toy);
        if (piece == null) {
            throw new Error("there is no piece at " + tox + ", " + toy);
        }
        this.checkTurn(Piece.oppositeColor(piece.color));
        this.pushToHand(piece);
        this.set(tox, toy, null);
        this.prevTurn();
    }

    /**
     * (x, y)の駒の移動可能な動きをすべて得る
     * 盤外，自分の駒取りは除外．二歩，王手放置などはチェックせず．
     */
    public getMovesFrom(x: number, y: number): IMove[] {
        // 盤外かもしれない(x, y)にcolorの駒が移動しても問題がないか
        const legal = function (x: number, y: number, color: Color) {
            if (x < 1 || 9 < x || y < 1 || 9 < y) {
                return false;
            }
            const piece = this.get(x, y);
            return piece == null || piece.color !== color;
        }.bind(this);
        const shouldStop = function (x: number, y: number, color: Color) {
            const piece = this.get(x, y);
            return piece != null && piece.color !== color;
        }.bind(this);
        const piece = this.get(x, y);
        if (piece == null) {
            return [];
        }
        const moveDef = MOVE_DEF[piece.kind];
        const ret = [];
        const from = {x, y};
        const unit = piece.color === Color.Black ? 1 : -1;
        if (moveDef.just) {
            for (const def of moveDef.just) {
                const to = {x: from.x + def[0] * unit, y: from.y + def[1] * unit};
                if (legal(to.x, to.y, piece.color)) {
                    ret.push({from, to});
                }
            }
        }
        if (moveDef.fly) {
            for (const def of moveDef.fly) {
                const to = {x: from.x + def[0] * unit, y: from.y + def[1] * unit};
                while (legal(to.x, to.y, piece.color)) {
                    ret.push({from, to: {x: to.x, y: to.y}});
                    if (shouldStop(to.x, to.y, piece.color)) {
                        break;
                    }
                    to.x += def[0] * unit;
                    to.y += def[1] * unit;
                }
            }
        }
        return ret;
    }

    /**
     * colorが打てる動きを全て得る
     */
    public getDropsBy(color: Color): IMove[] {
        const ret = [];
        const places: Array<{x: number; y: number}> = [];
        const fuExistsArray = [];
        for (let i = 1; i <= 9; i++) {
            let fuExists = false;
            for (let j = 1; j <= 9; j++) {
                const piece = this.get(i, j);
                if (piece == null) {
                    places.push({x: i, y: j});
                } else if (piece.color === color && piece.kind === "FU") {
                    fuExists = true;
                }
            }
            fuExistsArray.push(fuExists);
        }
        const done: {[index: string]: boolean} = {};
        for (const hand of this.hands[color]) {
            const kind = hand.kind;
            if (done[kind]) {
                continue;
            }
            done[kind] = true;
            const illegalUnpromotedRow = Shogi.getIllegalUnpromotedRow(kind);
            for (const place of places) {
                if (kind === "FU" && fuExistsArray[place.x - 1]) {
                    continue; // 二歩
                }
                if (illegalUnpromotedRow >= Shogi.getRowToOppositeEnd(place.y, color)) {
                    continue; // 行き所のない駒
                }
                ret.push({to: place, color, kind});
            }
        }
        return ret;
    }

    /**
     * (x, y)に行けるcolor側のkindの駒の動きを得る
     */
    public getMovesTo(x: number, y: number, kind: Kind, color: Color = this.turn): IMove[] {
        const to = {x, y};
        const ret = [];
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                const piece = this.get(i, j);
                if (!piece || piece.kind !== kind || piece.color !== color) {
                    continue;
                }
                const moves = this.getMovesFrom(i, j);
                if (moves.some((move) => move.to.x === x && move.to.y === y)) {
                    ret.push({from: {x: i, y: j}, to});
                }
            }
        }
        return ret;
    }

    /**
     * (x, y)の駒を得る
     */
    public get(x: number, y: number): Piece {
        return this.board[x - 1][y - 1];
    }

    /**
     * keyを種類，valueを枚数とするオブジェクトとして持ち駒の枚数一覧を返す．
     */
    public getHandsSummary(color: Color): HandSummary {
        const ret: HandSummary = {
            FU: 0,
            KY: 0,
            KE: 0,
            GI: 0,
            KI: 0,
            KA: 0,
            HI: 0,
        };
        for (const hand of this.hands[color]) {
            ret[hand.kind]++;
        }
        return ret;
    }

    // 以下editModeでの関数

    /**
     * (x, y)の駒を取ってcolorの持ち駒に加える
     */
    public captureByColor(x: number, y: number, color: Color): void {
        if (!this.flagEditMode) {
            throw new Error("cannot edit board without editMode");
        }
        const piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        if (piece.color !== color) {
            piece.inverse();
        }
        this.pushToHand(piece);
    }

    /**
     * (x, y)の駒をフリップする(先手→先手成→後手→後手成→)
     * 成功したらtrueを返す
     */
    public flip(x: number, y: number): boolean {
        if (!this.flagEditMode) {
            throw new Error("cannot edit board without editMode");
        }
        const piece = this.get(x, y);
        if (!piece) {
            return false;
        }
        if (Piece.isPromoted(piece.kind)) {
            piece.unpromote();
            piece.inverse();
        } else if (Piece.canPromote(piece.kind)) {
            piece.promote();
        } else {
            piece.inverse();
        }
        return true;
    }

    /**
     * 手番を設定する
     */
    public setTurn(color: Color): void {
        if (!this.flagEditMode) {
            throw new Error("cannot set turn without editMode");
        }
        this.turn = color;
    }

    // 以下private method

    /**
     * (x, y)に駒を置く
     */
    private set(x: number, y: number, piece: Piece): void {
        this.board[x - 1][y - 1] = piece;
    }

    /**
     * (x, y)の駒を取って反対側の持ち駒に加える
     */
    private capture(x: number, y: number): void {
        const piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        piece.inverse();
        this.pushToHand(piece);
    }

    /**
     * 駒pieceを持ち駒に加える
     */
    private pushToHand(piece: Piece): void {
        this.hands[piece.color].push(piece);
    }

    /**
     * color側のkindの駒を取って返す
     */
    private popFromHand(kind: Kind, color: Color): Piece {
        const hand = this.hands[color];
        for (let i = 0; i < hand.length; i++) {
            if (hand[i].kind !== kind) {
                continue;
            }
            const piece = hand[i];
            hand.splice(i, 1); // remove at i
            return piece;
        }
        throw new Error(color + " has no " + kind);
    }

    /**
     * 次の手番に行く
     */
    private nextTurn(): void {
        if (this.flagEditMode) {
            return;
        }
        this.turn = this.turn === Color.Black ? Color.White : Color.Black;
    }

    /**
     * 前の手番に行く
     */
    private prevTurn(): void {
        if (this.flagEditMode) {
            return;
        }
        this.nextTurn();
    }

    /**
     * colorの手番で問題ないか確認する．編集モードならok．
     */
    private checkTurn(color: Color): void {
        if (!this.flagEditMode && color !== this.turn) {
            throw new Error("cannot move opposite piece");
        }
    }
}

type HandSummary = {
    [K in Extract<Kind, "FU" | "KY" | "KE" | "GI" | "KI" | "KA" | "HI">]: number;
};

export interface ISettingType {
    preset: string;
    data?: {
        color: Color;
        board: Array<Array<{color?: Color; kind?: Kind}>>;
        hands: HandSummary[];
    };
}

export interface IMove {
    from?: {x: number; y: number};
    to: {x: number; y: number};
    kind?: Kind;
    color?: Color;
}

export {Color, Piece, IMoveDefinition};
