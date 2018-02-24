"use strict";
exports.__esModule = true;
/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var Color_1 = require("./Color");
var Piece_1 = require("./Piece");
require("./polyfills");
var Shogi = /** @class */ (function () {
    function Shogi(setting) {
        this.initialize(setting);
    }
    Shogi.getIllegalUnpromotedRow = function (kind) {
        switch (kind) {
            case "FU":
            case "KY":
                return 1;
            case "KE":
                return 2;
            default:
                return 0;
        }
    };
    // 手番の相手側から数えた段数
    Shogi.getRowToOppositeEnd = function (y, color) {
        return color === Color_1["default"].Black ? y : 10 - y;
    };
    // 盤面を初期化する
    // 初期局面(なければ平手)
    Shogi.prototype.initialize = function (setting) {
        if (setting === void 0) { setting = { preset: "HIRATE" }; }
        this.board = [];
        if (setting.preset !== "OTHER") {
            for (var i = 0; i < 9; i++) {
                this.board[i] = [];
                for (var j = 0; j < 9; j++) {
                    var csa = Shogi.preset[setting.preset].board[j].slice(24 - i * 3, 24 - i * 3 + 3);
                    this.board[i][j] = csa === " * " ? null : new Piece_1["default"](csa);
                }
            }
            this.turn = Shogi.preset[setting.preset].turn;
            this.hands = [[], []];
        }
        else {
            for (var i = 0; i < 9; i++) {
                this.board[i] = [];
                for (var j = 0; j < 9; j++) {
                    var p = setting.data.board[i][j];
                    this.board[i][j] = p.kind ? new Piece_1["default"]((p.color === Color_1["default"].Black ? "+" : "-") + p.kind) : null;
                }
            }
            this.turn = setting.data.color;
            this.hands = [[], []];
            for (var c = 0; c < 2; c++) {
                for (var k in setting.data.hands[c]) {
                    if (setting.data.hands[c].hasOwnProperty(k)) {
                        var csa = (c === 0 ? "+" : "-") + k;
                        for (var i = 0; i < setting.data.hands[c][k]; i++) {
                            this.hands[c].push(new Piece_1["default"](csa));
                        }
                    }
                }
            }
        }
        this.flagEditMode = false;
    };
    // SFENによる盤面表現の文字列で盤面を初期化する
    Shogi.prototype.initializeFromSFENString = function (sfen) {
        this.board = [];
        for (var i = 0; i < 9; i++) {
            this.board[i] = [];
            for (var j = 0; j < 9; j++) {
                this.board[i][j] = null;
            }
        }
        var segments = sfen.split(" ");
        var sfenBoard = segments[0];
        var x = 8;
        var y = 0;
        for (var i = 0; i < sfenBoard.length; i++) {
            var c = sfenBoard[i];
            var promoted = false;
            if (c === "+") {
                i++;
                c += sfenBoard[i];
            }
            if (c.match(/^[1-9]$/)) {
                x -= Number(c);
            }
            else if (c === "/") {
                y++;
                x = 8;
            }
            else {
                this.board[x][y] = Piece_1["default"].fromSFENString(c);
                x--;
            }
        }
        this.turn = segments[1] === "b" ? Color_1["default"].Black : Color_1["default"].White;
        this.hands = [[], []];
        var sfenHands = segments[2];
        if (sfenHands !== "-") {
            while (sfenHands.length > 0) {
                var count = 1;
                var m = sfenHands.match(/^[0-9]+/);
                if (m) {
                    count = Number(m[0]);
                    sfenHands = sfenHands.slice(m[0].length);
                }
                for (var i = 0; i < count; i++) {
                    var piece = Piece_1["default"].fromSFENString(sfenHands[0]);
                    this.hands[piece.color].push(piece);
                }
                sfenHands = sfenHands.slice(1);
            }
        }
    };
    // 編集モード切り替え
    // * 通常モード：移動時に手番と移動可能かどうかチェックし，移動可能範囲は手番側のみ返す．
    // * 編集モード：移動時に手番や移動可能かはチェックせず，移動可能範囲は両者とも返す．
    Shogi.prototype.editMode = function (flag) {
        this.flagEditMode = flag;
    };
    // (fromx, fromy)から(tox, toy)へ移動し，promoteなら成り，駒を取っていれば持ち駒に加える．．
    Shogi.prototype.move = function (fromx, fromy, tox, toy, promote) {
        if (promote === void 0) { promote = false; }
        var piece = this.get(fromx, fromy);
        if (piece == null) {
            throw new Error("no piece found at " + fromx + ", " + fromy);
        }
        this.checkTurn(piece.color);
        if (!this.flagEditMode) {
            if (!this.getMovesFrom(fromx, fromy).some(function (move) {
                return move.to.x === tox && move.to.y === toy;
            })) {
                throw new Error("cannot move from " + fromx + ", " + fromy + " to " + tox + ", " + toy);
            }
        }
        if (this.get(tox, toy) != null) {
            this.capture(tox, toy);
        }
        // 行き所のない駒
        var deadEnd = Shogi.getIllegalUnpromotedRow(piece.kind) >= Shogi.getRowToOppositeEnd(toy, piece.color);
        if (promote || deadEnd) {
            piece.promote();
        }
        this.set(tox, toy, piece);
        this.set(fromx, fromy, null);
        this.nextTurn();
    };
    // moveの逆を行う．つまり(tox, toy)から(fromx, fromy)へ移動し，駒を取っていたら戻し，promoteなら成りを戻す．
    Shogi.prototype.unmove = function (fromx, fromy, tox, toy, promote, capture) {
        if (promote === void 0) { promote = false; }
        var piece = this.get(tox, toy);
        if (piece == null) {
            throw new Error("no piece found at " + tox + ", " + toy);
        }
        this.checkTurn(Piece_1["default"].oppositeColor(piece.color));
        var captured;
        if (capture) {
            captured = this.popFromHand(Piece_1["default"].unpromote(capture), piece.color);
            captured.inverse();
        }
        var editMode = this.flagEditMode;
        this.editMode(true);
        this.move(tox, toy, fromx, fromy);
        if (promote) {
            piece.unpromote();
        }
        if (capture) {
            if (Piece_1["default"].isPromoted(capture)) {
                captured.promote();
            }
            this.set(tox, toy, captured);
        }
        this.editMode(editMode);
        this.prevTurn();
    };
    // (tox, toy)へcolorの持ち駒のkindを打つ．
    Shogi.prototype.drop = function (tox, toy, kind, color) {
        if (color === void 0) { color = this.turn; }
        this.checkTurn(color);
        if (this.get(tox, toy) != null) {
            throw new Error("there is a piece at " + tox + ", " + toy);
        }
        if (!this.getDropsBy(color).some(function (move) {
            return move.to.x === tox && move.to.y === toy && move.kind === kind;
        })) {
            throw new Error("Cannot move");
        }
        var piece = this.popFromHand(kind, color);
        this.set(tox, toy, piece);
        this.nextTurn();
    };
    // dropの逆を行う，つまり(tox, toy)の駒を駒台に戻す．
    Shogi.prototype.undrop = function (tox, toy) {
        var piece = this.get(tox, toy);
        if (piece == null) {
            throw new Error("there is no piece at " + tox + ", " + toy);
        }
        this.checkTurn(Piece_1["default"].oppositeColor(piece.color));
        this.pushToHand(piece);
        this.set(tox, toy, null);
        this.prevTurn();
    };
    // CSAによる盤面表現の文字列を返す
    Shogi.prototype.toCSAString = function () {
        var ret = [];
        for (var y = 0; y < 9; y++) {
            var line = "P" + (y + 1);
            for (var x = 8; x >= 0; x--) {
                var piece = this.board[x][y];
                line += piece == null ? " * " : piece.toCSAString();
            }
            ret.push(line);
        }
        for (var i = 0; i < 2; i++) {
            var line = "P" + "+-"[i];
            for (var _i = 0, _a = this.hands[i]; _i < _a.length; _i++) {
                var hand = _a[_i];
                line += "00" + hand.kind;
            }
            ret.push(line);
        }
        ret.push(this.turn === Color_1["default"].Black ? "+" : "-");
        return ret.join("\n");
    };
    // SFENによる盤面表現の文字列を返す
    Shogi.prototype.toSFENString = function (moveCount) {
        if (moveCount === void 0) { moveCount = 1; }
        var ret = [];
        var sfenBoard = [];
        for (var y = 0; y < 9; y++) {
            var line = "";
            var empty = 0;
            for (var x = 8; x >= 0; x--) {
                var piece = this.board[x][y];
                if (piece == null) {
                    empty++;
                }
                else {
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
        ret.push(this.turn === Color_1["default"].Black ? "b" : "w");
        if (this.hands[0].length === 0 && this.hands[1].length === 0) {
            ret.push("-");
        }
        else {
            var sfenHands = "";
            var kinds = ["R", "B", "G", "S", "N", "L", "P", "r", "b", "g", "s", "n", "l", "p"];
            var count = {};
            for (var i = 0; i < 2; i++) {
                for (var _i = 0, _a = this.hands[i]; _i < _a.length; _i++) {
                    var hand = _a[_i];
                    var key = hand.toSFENString();
                    count[key] = (count[key] || 0) + 1;
                }
            }
            for (var _b = 0, kinds_1 = kinds; _b < kinds_1.length; _b++) {
                var kind = kinds_1[_b];
                if (count[kind] > 0) {
                    sfenHands += (count[kind] > 1 ? count[kind] : "") + kind;
                }
            }
            ret.push(sfenHands);
        }
        ret.push("" + moveCount);
        return ret.join(" ");
    };
    // (x, y)の駒の移動可能な動きをすべて得る
    // 盤外，自分の駒取りは除外．二歩，王手放置などはチェックせず．
    Shogi.prototype.getMovesFrom = function (x, y) {
        // 盤外かもしれない(x, y)にcolorの駒が移動しても問題がないか
        var legal = function (x, y, color) {
            if (x < 1 || 9 < x || y < 1 || 9 < y) {
                return false;
            }
            var piece = this.get(x, y);
            return piece == null || piece.color !== color;
        }.bind(this);
        var shouldStop = function (x, y, color) {
            var piece = this.get(x, y);
            return piece != null && piece.color !== color;
        }.bind(this);
        var piece = this.get(x, y);
        if (piece == null) {
            return [];
        }
        var moveDef = Piece_1["default"].getMoveDef(piece.kind);
        var ret = [];
        var from = { x: x, y: y };
        if (moveDef.just) {
            for (var _i = 0, _a = moveDef.just; _i < _a.length; _i++) {
                var def = _a[_i];
                if (piece.color === Color_1["default"].White) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                var to = { x: from.x + def[0], y: from.y + def[1] };
                if (legal(to.x, to.y, piece.color)) {
                    ret.push({ from: from, to: to });
                }
            }
        }
        if (moveDef.fly) {
            for (var _b = 0, _c = moveDef.fly; _b < _c.length; _b++) {
                var def = _c[_b];
                if (piece.color === Color_1["default"].White) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                var to = { x: from.x + def[0], y: from.y + def[1] };
                while (legal(to.x, to.y, piece.color)) {
                    ret.push({ from: from, to: { x: to.x, y: to.y } });
                    if (shouldStop(to.x, to.y, piece.color)) {
                        break;
                    }
                    to.x += def[0];
                    to.y += def[1];
                }
            }
        }
        return ret;
    };
    // colorが打てる動きを全て得る
    Shogi.prototype.getDropsBy = function (color) {
        var ret = [];
        var places = [];
        var fuExistsArray = [];
        for (var i = 1; i <= 9; i++) {
            var fuExists = false;
            for (var j = 1; j <= 9; j++) {
                var piece = this.get(i, j);
                if (piece == null) {
                    places.push({ x: i, y: j });
                }
                else if (piece.color === color && piece.kind === "FU") {
                    fuExists = true;
                }
            }
            fuExistsArray.push(fuExists);
        }
        var done = {};
        for (var _i = 0, _a = this.hands[color]; _i < _a.length; _i++) {
            var hand = _a[_i];
            var kind = hand.kind;
            if (done[kind]) {
                continue;
            }
            done[kind] = true;
            var illegalUnpromotedRow = Shogi.getIllegalUnpromotedRow(kind);
            for (var _b = 0, places_1 = places; _b < places_1.length; _b++) {
                var place = places_1[_b];
                if (kind === "FU" && fuExistsArray[place.x - 1]) {
                    continue; // 二歩
                }
                if (illegalUnpromotedRow >= Shogi.getRowToOppositeEnd(place.y, color)) {
                    continue; // 行き所のない駒
                }
                ret.push({ to: place, color: color, kind: kind });
            }
        }
        return ret;
    };
    // (x, y)に行けるcolor側のkindの駒の動きを得る
    Shogi.prototype.getMovesTo = function (x, y, kind, color) {
        if (color === void 0) { color = this.turn; }
        var to = { x: x, y: y };
        var ret = [];
        for (var i = 1; i <= 9; i++) {
            for (var j = 1; j <= 9; j++) {
                var piece = this.get(i, j);
                if (!piece || piece.kind !== kind || piece.color !== color) {
                    continue;
                }
                var moves = this.getMovesFrom(i, j);
                if (moves.some(function (move) { return move.to.x === x && move.to.y === y; })) {
                    ret.push({ from: { x: i, y: j }, to: to });
                }
            }
        }
        return ret;
    };
    // (x, y)の駒を得る
    Shogi.prototype.get = function (x, y) {
        return this.board[x - 1][y - 1];
    };
    // keyを種類，valueを枚数とするオブジェクトとして持ち駒の枚数一覧を返す．
    Shogi.prototype.getHandsSummary = function (color) {
        var ret = {
            FU: 0,
            KY: 0,
            KE: 0,
            GI: 0,
            KI: 0,
            KA: 0,
            HI: 0
        };
        for (var _i = 0, _a = this.hands[color]; _i < _a.length; _i++) {
            var hand = _a[_i];
            ret[hand.kind]++;
        }
        return ret;
    };
    // 以下editModeでの関数
    // (x, y)の駒を取ってcolorの持ち駒に加える
    Shogi.prototype.captureByColor = function (x, y, color) {
        if (!this.flagEditMode) {
            throw new Error("cannot edit board without editMode");
        }
        var piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        if (piece.color !== color) {
            piece.inverse();
        }
        this.pushToHand(piece);
    };
    // (x, y)の駒をフリップする(先手→先手成→後手→後手成→)
    // 成功したらtrueを返す
    Shogi.prototype.flip = function (x, y) {
        if (!this.flagEditMode) {
            throw new Error("cannot edit board without editMode");
        }
        var piece = this.get(x, y);
        if (!piece) {
            return false;
        }
        if (Piece_1["default"].isPromoted(piece.kind)) {
            piece.unpromote();
            piece.inverse();
        }
        else if (Piece_1["default"].canPromote(piece.kind)) {
            piece.promote();
        }
        else {
            piece.inverse();
        }
        return true;
    };
    // 手番を設定する
    Shogi.prototype.setTurn = function (color) {
        if (!this.flagEditMode) {
            throw new Error("cannot set turn without editMode");
        }
        this.turn = color;
    };
    // 以下private method
    // (x, y)に駒を置く
    Shogi.prototype.set = function (x, y, piece) {
        this.board[x - 1][y - 1] = piece;
    };
    // (x, y)の駒を取って反対側の持ち駒に加える
    Shogi.prototype.capture = function (x, y) {
        var piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        piece.inverse();
        this.pushToHand(piece);
    };
    // 駒pieceを持ち駒に加える
    Shogi.prototype.pushToHand = function (piece) {
        this.hands[piece.color].push(piece);
    };
    // color側のkindの駒を取って返す
    Shogi.prototype.popFromHand = function (kind, color) {
        var hand = this.hands[color];
        for (var i = 0; i < hand.length; i++) {
            if (hand[i].kind !== kind) {
                continue;
            }
            var piece = hand[i];
            hand.splice(i, 1); // remove at i
            return piece;
        }
        throw new Error(color + " has no " + kind);
    };
    // 次の手番に行く
    Shogi.prototype.nextTurn = function () {
        if (this.flagEditMode) {
            return;
        }
        this.turn = this.turn === Color_1["default"].Black ? Color_1["default"].White : Color_1["default"].Black;
    };
    // 前の手番に行く
    Shogi.prototype.prevTurn = function () {
        if (this.flagEditMode) {
            return;
        }
        this.nextTurn();
    };
    // colorの手番で問題ないか確認する．編集モードならok．
    Shogi.prototype.checkTurn = function (color) {
        if (!this.flagEditMode && color !== this.turn) {
            throw new Error("cannot move opposite piece");
        }
    };
    // 既定の初期局面
    Shogi.preset = {
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
            turn: Color_1["default"].Black
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
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
            turn: Color_1["default"].White
        }
    };
    return Shogi;
}());
exports["default"] = Shogi;
// enum Kind {HI, KY, KE, GI, KI, KA, HI, OU, TO, NY, NK, NG, UM, RY}
