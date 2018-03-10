/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import Color from "./Color";
import Piece from "./Piece";
import IMoveDefinition from "./IMoveDefinition";
import "./polyfills";

export default class Shogi {
    // 既定の初期局面
    public static preset: { [index: string]: { board: string[]; turn: Color; } } = {
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
        "KA": { // tslint:disable-line object-literal-sort-keys
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

    private static getIllegalUnpromotedRow(kind: string) {
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

    // 手番の相手側から数えた段数
    private static getRowToOppositeEnd(y: number, color: Color) {
        return color === Color.Black ? y : 10 - y;
    }

    public board: Piece[][]; // 盤面
    public hands: Piece[][]; // 持ち駒
    public turn: Color; // 次の手番
    public flagEditMode: boolean; // 編集モードかどうか
    constructor(setting?: ISettingType) {
        this.initialize(setting);
    }

    // 盤面を初期化する
    // 初期局面(なければ平手)
    public initialize(setting: ISettingType = {preset: "HIRATE"}): void {
        this.board = [];
        if (setting.preset !== "OTHER") {
            for (let i = 0; i < 9; i++) {
                this.board[i] = [];
                for (let j = 0; j < 9; j++) {
                    const csa: string = Shogi.preset[setting.preset].board[j].slice(24 - i * 3, 24 - i * 3 + 3);
                    this.board[i][j] = csa === " * " ? null : new Piece(csa);
                }
            }
            this.turn = Shogi.preset[setting.preset].turn;
            this.hands = [[], []];
        } else {
            for (let i = 0; i < 9; i++) {
                this.board[i] = [];
                for (let j = 0; j < 9; j++) {
                    const p = setting.data.board[i][j];
                    this.board[i][j] = p.kind ? new Piece((p.color === Color.Black ? "+" : "-") + p.kind) : null;
                }
            }
            this.turn = setting.data.color;
            this.hands = [[], []];
            for (let c = 0; c < 2; c++) {
                for (const k in setting.data.hands[c]) {
                    if (setting.data.hands[c].hasOwnProperty(k)) {
                        const csa = (c === 0 ? "+" : "-") + k;
                        for (let i = 0; i < setting.data.hands[c][k]; i++) {
                            this.hands[c].push(new Piece(csa));
                        }
                    }
                }
            }
        }
        this.flagEditMode = false;
    }

    // SFENによる盤面表現の文字列で盤面を初期化する
    public initializeFromSFENString(sfen: string): void {
        this.board = [];
        for (let i = 0; i < 9; i++) {
            this.board[i] = [];
            for (let j = 0; j < 9; j++) {
                this.board[i][j] = null;
            }
        }
        const segments = sfen.split(" ");
        const sfenBoard = segments[0];
        let x = 8;
        let y = 0;
        for (let i = 0; i < sfenBoard.length; i++) {
            let c = sfenBoard[i];
            const promoted = false;
            if (c === "+") {
                i++;
                c += sfenBoard[i];
            }
            if (c.match(/^[1-9]$/)) {
                x -= Number(c);
            } else if (c === "/") {
                y++;
                x = 8;
            } else {
                this.board[x][y] = Piece.fromSFENString(c);
                x--;
            }
        }
        this.turn = segments[1] === "b" ? Color.Black : Color.White;
        this.hands = [[], []];
        let sfenHands = segments[2];
        if (sfenHands !== "-") {
            while (sfenHands.length > 0) {
                let count = 1;
                const m = sfenHands.match(/^[0-9]+/);
                if (m) {
                    count = Number(m[0]);
                    sfenHands = sfenHands.slice(m[0].length);
                }
                for (let i = 0; i < count; i++) {
                    const piece = Piece.fromSFENString(sfenHands[0]);
                    this.hands[piece.color].push(piece);
                }
                sfenHands = sfenHands.slice(1);
            }
        }
    }

    // 編集モード切り替え
    // * 通常モード：移動時に手番と移動可能かどうかチェックし，移動可能範囲は手番側のみ返す．
    // * 編集モード：移動時に手番や移動可能かはチェックせず，移動可能範囲は両者とも返す．
    public editMode(flag: boolean): void {
        this.flagEditMode = flag;
    }

    // (fromx, fromy)から(tox, toy)へ移動し，promoteなら成り，駒を取っていれば持ち駒に加える．．
    public move(fromx: number, fromy: number, tox: number, toy: number, promote: boolean = false): void {
        const piece = this.get(fromx, fromy);
        if (piece == null) {
            throw new Error("no piece found at " + fromx + ", " + fromy);
        }
        this.checkTurn(piece.color);
        if (!this.flagEditMode) {
            if (!this.getMovesFrom(fromx, fromy).some((move) => {
                    return move.to.x === tox && move.to.y === toy;
                })) {
                throw new Error("cannot move from " + fromx + ", " + fromy + " to " + tox + ", " + toy);
            }
        }
        if (this.get(tox, toy) != null) {
            this.capture(tox, toy);
        }
        // 行き所のない駒
        const deadEnd = Shogi.getIllegalUnpromotedRow(piece.kind) >= Shogi.getRowToOppositeEnd(toy, piece.color);
        if (promote || deadEnd) {
            piece.promote();
        }
        this.set(tox, toy, piece);
        this.set(fromx, fromy, null);
        this.nextTurn();
    }

    // moveの逆を行う．つまり(tox, toy)から(fromx, fromy)へ移動し，駒を取っていたら戻し，promoteなら成りを戻す．
    public unmove(fromx: number,
                  fromy: number,
                  tox: number,
                  toy: number,
                  promote: boolean = false,
                  capture?: string,): void {
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

    // (tox, toy)へcolorの持ち駒のkindを打つ．
    public drop(tox: number, toy: number, kind: string, color: Color = this.turn): void {
        this.checkTurn(color);
        if (this.get(tox, toy) != null) {
            throw new Error("there is a piece at " + tox + ", " + toy);
        }
        if (!this.getDropsBy(color).some((move: IMove) => {
                return move.to.x === tox && move.to.y === toy && move.kind === kind;
            })) {
            throw new Error("Cannot move");
        }
        const piece = this.popFromHand(kind, color);
        this.set(tox, toy, piece);
        this.nextTurn();
    }

    // dropの逆を行う，つまり(tox, toy)の駒を駒台に戻す．
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

    // CSAによる盤面表現の文字列を返す
    public toCSAString(): string {
        const ret = [];
        for (let y = 0; y < 9; y++) {
            let line = "P" + (y + 1);
            for (let x = 8; x >= 0; x--) {
                const piece = this.board[x][y];
                line += piece == null ? " * " : piece.toCSAString();
            }
            ret.push(line);
        }
        for (let i = 0; i < 2; i++) {
            let line = "P" + "+-"[i];
            for (const hand of this.hands[i]) {
                line += "00" + hand.kind;
            }
            ret.push(line);
        }
        ret.push(this.turn === Color.Black ? "+" : "-");
        return ret.join("\n");
    }

    // SFENによる盤面表現の文字列を返す
    public toSFENString(moveCount = 1): string {
        const ret = [];
        const sfenBoard = [];
        for (let y = 0; y < 9; y++) {
            let line = "";
            let empty = 0;
            for (let x = 8; x >= 0; x--) {
                const piece = this.board[x][y];
                if (piece == null) {
                    empty++;
                } else {
                    if (empty > 0) {
                        line += "" + empty;
                        empty = 0;
                    }
                    line += piece.toSFENString();
                }
            }
            if (empty > 0) {
                line += "" + empty;
            }
            sfenBoard.push(line);
        }
        ret.push(sfenBoard.join("/"));
        ret.push(this.turn === Color.Black ? "b" : "w");
        if (this.hands[0].length === 0 && this.hands[1].length === 0) {
            ret.push("-");
        } else {
            let sfenHands = "";
            const kinds = ["R", "B", "G", "S", "N", "L", "P", "r", "b", "g", "s", "n", "l", "p"];
            const count = {};
            for (let i = 0; i < 2; i++) {
                for (const hand of this.hands[i]) {
                    const key = hand.toSFENString();
                    count[key] = (count[key] || 0) + 1;
                }
            }
            for (const kind of kinds) {
                if (count[kind] > 0) {
                    sfenHands += (count[kind] > 1 ? count[kind] : "") + kind;
                }
            }
            ret.push(sfenHands);
        }
        ret.push("" + moveCount);
        return ret.join(" ");
    }

    // (x, y)の駒の移動可能な動きをすべて得る
    // 盤外，自分の駒取りは除外．二歩，王手放置などはチェックせず．
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
        const moveDef = Piece.getMoveDef(piece.kind);
        const ret = [];
        const from = {x, y};
        if (moveDef.just) {
            for (const def of moveDef.just) {
                if (piece.color === Color.White) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                const to = {x: from.x + def[0], y: from.y + def[1]};
                if (legal(to.x, to.y, piece.color)) {
                    ret.push({from, to});
                }
            }
        }
        if (moveDef.fly) {
            for (const def of moveDef.fly) {
                if (piece.color === Color.White) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                const to = {x: from.x + def[0], y: from.y + def[1]};
                while (legal(to.x, to.y, piece.color)) {
                    ret.push({from, to: {x: to.x, y: to.y}});
                    if (shouldStop(to.x, to.y, piece.color)) {
                        break;
                    }
                    to.x += def[0];
                    to.y += def[1];
                }
            }
        }
        return ret;
    }

    // colorが打てる動きを全て得る
    public getDropsBy(color: Color): IMove[] {
        const ret = [];
        const places: Array<{ x: number, y: number }> = [];
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
        const done: { [index: string]: boolean } = {};
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

    // (x, y)に行けるcolor側のkindの駒の動きを得る
    public getMovesTo(x: number, y: number, kind: string, color: Color = this.turn): IMove[] {
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

    // (x, y)の駒を得る
    public get(x: number, y: number): Piece {
        return this.board[x - 1][y - 1];
    }

    // keyを種類，valueを枚数とするオブジェクトとして持ち駒の枚数一覧を返す．
    public getHandsSummary(color: Color): { [index: string]: number } {
        const ret: { [index: string]: number } = {
            FU: 0,
            KY: 0,
            KE: 0, // tslint:disable-line object-literal-sort-keys
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

    // (x, y)の駒を取ってcolorの持ち駒に加える
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

    // (x, y)の駒をフリップする(先手→先手成→後手→後手成→)
    // 成功したらtrueを返す
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

    // 手番を設定する
    public setTurn(color: Color): void {
        if (!this.flagEditMode) {
            throw new Error("cannot set turn without editMode");
        }
        this.turn = color;
    }

    // 以下private method

    // (x, y)に駒を置く
    private set(x: number, y: number, piece: Piece): void {
        this.board[x - 1][y - 1] = piece;
    }

    // (x, y)の駒を取って反対側の持ち駒に加える
    private capture(x: number, y: number): void {
        const piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        piece.inverse();
        this.pushToHand(piece);
    }

    // 駒pieceを持ち駒に加える
    private pushToHand(piece: Piece): void {
        this.hands[piece.color].push(piece);
    }

    // color側のkindの駒を取って返す
    private popFromHand(kind: string, color: Color): Piece {
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

    // 次の手番に行く
    private nextTurn(): void {
        if (this.flagEditMode) {
            return;
        }
        this.turn = this.turn === Color.Black ? Color.White : Color.Black;
    }

    // 前の手番に行く
    private prevTurn(): void {
        if (this.flagEditMode) {
            return;
        }
        this.nextTurn();
    }

    // colorの手番で問題ないか確認する．編集モードならok．
    private checkTurn(color: Color): void {
        if (!this.flagEditMode && color !== this.turn) {
            throw new Error("cannot move opposite piece");
        }
    }
}

export interface ISettingType {
    preset: string;
    data?: {
        color: Color;
        board: Array<Array<{ color?: Color; kind?: string; }>>;
        hands: Array<{ [index: string]: number }>;
    };
}

export interface IMove {
    from?: { x: number; y: number; };
    to: { x: number; y: number; };
    kind?: string;
    color?: Color;
}
export {Color, Piece, IMoveDefinition};
// enum Kind {HI, KY, KE, GI, KI, KA, HI, OU, TO, NY, NK, NG, UM, RY}
