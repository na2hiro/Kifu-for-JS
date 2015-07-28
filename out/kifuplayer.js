(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../src/JSONKifuFormat.d.ts" />
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var ShogiJS = require("../node_modules/shogi.js/lib/shogi");
var Shogi = ShogiJS.Shogi;
var Piece = ShogiJS.Piece;
var Color = ShogiJS.Color;
function canPromote(place, color) {
    return color == Color.Black ? place.y <= 3 : place.y >= 7;
}
exports.canPromote = canPromote;
// 最小形式の棋譜をnormalizeする
// 最小形式: (指し) from, to, promote; (打ち) piece, to
function normalizeMinimal(obj) {
    var shogi = new Shogi(obj.initial || undefined);
    normalizeMinimalMoves(shogi, obj.moves);
    return obj;
}
exports.normalizeMinimal = normalizeMinimal;
function normalizeMinimalMoves(shogi, moves, lastMove) {
    for (var i = 0; i < moves.length; i++) {
        var last = i <= 1 ? lastMove : moves[i - 1];
        var move = moves[i].move;
        if (!move)
            continue;
        // 手番
        move.color = shogi.turn == Color.Black;
        if (move.from) {
            // move
            // toからsame復元
            if (last && last.move && move.to.x == last.move.to.x && move.to.y == last.move.to.y) {
                move.same = true;
            }
            // capture復元
            addCaptureInformation(shogi, move);
            // piece復元
            if (!move.piece) {
                move.piece = shogi.get(move.from.x, move.from.y).kind;
            }
            // 不成復元
            if (!move.promote && !Piece.isPromoted(move.piece) && Piece.canPromote(move.piece)) {
                // 成ってない
                if (canPromote(move.to, shogi.turn) || canPromote(move.from, shogi.turn)) {
                    move.promote = false;
                }
            }
            // relative復元
            addRelativeInformation(shogi, move);
            try {
                shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
            }
            catch (e) {
                throw i + "手目で失敗しました: " + e;
            }
        }
        else {
            // drop
            if (shogi.getMovesTo(move.to.x, move.to.y, move.piece).length > 0) {
                move.relative = "H";
            }
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    for (var i = moves.length - 1; i >= 0; i--) {
        var move = moves[i].move;
        if (move) {
            if (move.from) {
                shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
            }
            else {
                shogi.undrop(move.to.x, move.to.y);
            }
        }
        last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (var j = 0; j < moves[i].forks.length; j++) {
                normalizeMinimalMoves(shogi, moves[i].forks[j], last);
            }
        }
    }
    restoreColorOfIllegalAction(moves);
}
function normalizeKIF(obj) {
    var shogi = new Shogi(obj.initial || undefined);
    normalizeKIFMoves(shogi, obj.moves);
    return obj;
}
exports.normalizeKIF = normalizeKIF;
function normalizeKIFMoves(shogi, moves, lastMove) {
    for (var i = 0; i < moves.length; i++) {
        var last = i <= 1 ? lastMove : moves[i - 1];
        var move = moves[i].move;
        if (!move)
            continue;
        // 手番
        move.color = shogi.turn == Color.Black;
        if (move.from) {
            // move
            // sameからto復元
            if (move.same)
                move.to = last.move.to;
            // capture復元
            addCaptureInformation(shogi, move);
            // 不成復元
            if (!move.promote && !Piece.isPromoted(move.piece) && Piece.canPromote(move.piece)) {
                // 成ってない
                if (canPromote(move.to, shogi.turn) || canPromote(move.from, shogi.turn)) {
                    move.promote = false;
                }
            }
            // relative復元
            addRelativeInformation(shogi, move);
            try {
                shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
            }
            catch (e) {
                throw i + "手目で失敗しました: " + e;
            }
        }
        else {
            // drop
            if (shogi.getMovesTo(move.to.x, move.to.y, move.piece).length > 0) {
                move.relative = "H";
            }
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    for (var i = moves.length - 1; i >= 0; i--) {
        var move = moves[i].move;
        if (move) {
            if (move.from) {
                shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
            }
            else {
                shogi.undrop(move.to.x, move.to.y);
            }
        }
        last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (var j = 0; j < moves[i].forks.length; j++) {
                normalizeKIFMoves(shogi, moves[i].forks[j], last);
            }
        }
    }
    restoreColorOfIllegalAction(moves);
}
function normalizeKI2(obj) {
    var shogi = new Shogi(obj.initial || undefined);
    normalizeKI2Moves(shogi, obj.moves);
    return obj;
}
exports.normalizeKI2 = normalizeKI2;
function normalizeKI2Moves(shogi, moves, lastMove) {
    for (var i = 0; i < moves.length; i++) {
        var last = i <= 1 ? lastMove : moves[i - 1];
        var move = moves[i].move;
        if (!move)
            continue;
        // 手番
        move.color = shogi.turn == Color.Black;
        // 同からto復元
        if (move.same)
            move.to = last.move.to;
        // from復元
        var candMoves = shogi.getMovesTo(move.to.x, move.to.y, move.piece);
        if (move.relative == "H" || candMoves.length == 0) {
        }
        else if (candMoves.length == 1) {
            move.from = candMoves[0].from;
        }
        else {
            // 相対逆算
            var moveAns = filterMovesByRelatives(move.relative, shogi.turn, candMoves);
            if (moveAns.length != 1)
                throw "相対情報が不完全で複数の候補があります";
            move.from = moveAns[0].from;
        }
        if (move.from) {
            // move
            // capture復元
            addCaptureInformation(shogi, move);
            try {
                shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
            }
            catch (e) {
                throw i + "手目で失敗しました: " + e;
            }
        }
        else {
            // drop
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    for (var i = moves.length - 1; i >= 0; i--) {
        var move = moves[i].move;
        if (!move)
            continue;
        if (move.from) {
            shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
        }
        else {
            shogi.undrop(move.to.x, move.to.y);
        }
        last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (var j = 0; j < moves[i].forks.length; j++) {
                normalizeKI2Moves(shogi, moves[i].forks[j], last);
            }
        }
    }
    restoreColorOfIllegalAction(moves);
}
function normalizeCSA(obj) {
    restorePreset(obj);
    var shogi = new Shogi(obj.initial || undefined);
    for (var i = 0; i < obj.moves.length; i++) {
        var move = obj.moves[i].move;
        if (!move)
            continue;
        // 手番
        move.color = shogi.turn == Color.Black;
        if (move.from) {
            // move
            // same復元
            if (i > 0 && obj.moves[i - 1].move && obj.moves[i - 1].move.to.x == move.to.x && obj.moves[i - 1].move.to.y == move.to.y) {
                move.same = true;
            }
            // capture復元
            addCaptureInformation(shogi, move);
            if (Piece.isPromoted(move.piece)) {
                // 成かも
                var from = shogi.get(move.from.x, move.from.y);
                if (from.kind != move.piece) {
                    move.piece = from.kind;
                    move.promote = true;
                }
            }
            else if (Piece.canPromote(move.piece)) {
                // 不成かも
                if (canPromote(move.to, shogi.turn) || canPromote(move.from, shogi.turn)) {
                    move.promote = false;
                }
            }
            // relative復元
            addRelativeInformation(shogi, move);
            try {
                shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
            }
            catch (e) {
                throw i + "手目で失敗しました: " + e;
            }
        }
        else {
            // drop
            if (shogi.getMovesTo(move.to.x, move.to.y, move.piece).length > 0) {
                move.relative = "H";
            }
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    return obj;
}
exports.normalizeCSA = normalizeCSA;
function addRelativeInformation(shogi, move) {
    var moveVectors = shogi.getMovesTo(move.to.x, move.to.y, move.piece).map(function (mv) { return flipVector(shogi.turn, spaceshipVector(mv.to, mv.from)); });
    if (moveVectors.length >= 2) {
        var realVector = flipVector(shogi.turn, spaceshipVector(move.to, move.from));
        move.relative = function () {
            // 上下方向唯一
            if (moveVectors.filter(function (mv) { return mv.y == realVector.y; }).length == 1)
                return YToUMD(realVector.y);
            // 左右方向唯一
            if (moveVectors.filter(function (mv) { return mv.x == realVector.x; }).length == 1) {
                if ((move.piece == "UM" || move.piece == "RY") && realVector.x == 0) {
                    //直はだめ
                    return XToLCR(moveVectors.filter(function (mv) { return mv.x < 0; }).length == 0 ? -1 : 1);
                }
                else {
                    return XToLCR(realVector.x);
                }
            }
            //上下も左右も他の駒がいる
            return XToLCR(realVector.x) + YToUMD(realVector.y);
        }();
    }
}
function addCaptureInformation(shogi, move) {
    var to = shogi.get(move.to.x, move.to.y);
    if (to)
        move.capture = to.kind;
}
function flipVector(color, vector) {
    return color == Color.Black ? vector : { x: -vector.x, y: -vector.y };
}
function spaceship(a, b) {
    return a == b ? 0 : (a > b ? 1 : -1);
}
function spaceshipVector(a, b) {
    return { x: spaceship(a.x, b.x), y: spaceship(a.y, b.y) };
}
// yの段から移動した場合の相対情報
function YToUMD(y) {
    return y == 0 ? "M" : (y > 0 ? "D" : "U");
}
// xの行から移動した場合の相対情報
function XToLCR(x) {
    return x == 0 ? "C" : (x > 0 ? "R" : "L");
}
function filterMovesByRelatives(relative, color, moves) {
    var ret = [];
    for (var i = 0; i < moves.length; i++) {
        if (relative.split("").every(function (rel) { return moveSatisfiesRelative(rel, color, moves[i]); })) {
            ret.push(moves[i]);
        }
    }
    return ret;
}
function moveSatisfiesRelative(relative, color, move) {
    var vec = flipVector(color, { x: move.to.x - move.from.x, y: move.to.y - move.from.y });
    switch (relative) {
        case "U":
            return vec.y < 0;
        case "M":
            return vec.y == 0;
        case "D":
            return vec.y > 0;
        case "L":
            return vec.x < 0;
        case "C":
            return vec.x == 0;
        case "R":
            return vec.x > 0;
    }
}
// CSA等で盤面みたままで表現されているものをpresetに戻せれば戻す
function restorePreset(obj) {
    if (!obj.initial || obj.initial.preset != "OTHER")
        return;
    var hirate = [
        [{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
        [{ color: false, kind: "KE" }, { color: false, kind: "KA" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
        [{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
        [{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
        [{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
        [{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
        [{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
        [{ color: false, kind: "KE" }, { color: false, kind: "HI" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
        [{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
    ];
    var diff = [];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (!samePiece(obj.initial.data.board[i][j], hirate[i][j]))
                diff.push("" + (i + 1) + (j + 1));
        }
    }
    var presets = {};
    presets[""] = "HIRATE";
    presets["11"] = "KY";
    presets["91"] = "KY_R";
    presets["22"] = "KA";
    presets["82"] = "HI";
    presets["1182"] = "HIKY";
    presets["2282"] = "2";
    presets["228291"] = "3";
    presets["11228291"] = "4";
    presets["1122818291"] = "5";
    presets["1121228291"] = "5_L";
    presets["112122818291"] = "6";
    presets["1121223171818291"] = "8";
    presets["11212231416171818291"] = "10";
    var preset = presets[diff.sort().join("")];
    if (preset == "HIRATE") {
        if (obj.initial.data.color == true) {
            obj.initial.preset = "HIRATE";
            delete obj.initial.data;
        }
    }
    else if (preset && obj.initial.data.color == false) {
        obj.initial.preset = preset;
        delete obj.initial.data;
    }
}
function samePiece(p1, p2) {
    return (typeof p1.color == "undefined" && typeof p2.color == "undefined") ||
        (typeof p1.color != "undefined" && typeof p2.color != "undefined" && p1.color == p2.color && p1.kind == p2.kind);
}
function restoreColorOfIllegalAction(moves) {
    if (moves[moves.length - 1].special == "ILLEGAL_ACTION") {
        moves[moves.length - 1].special = (moves[moves.length - 2] && moves[moves.length - 2].move && moves[moves.length - 2].move.color == false ? "-" : "+") + "ILLEGAL_ACTION";
    }
}

},{"../node_modules/shogi.js/lib/shogi":3}],2:[function(require,module,exports){
/// <reference path="../src/JSONKifuFormat.d.ts" />
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var ShogiJS = require('../node_modules/shogi.js/lib/shogi');
var Color = ShogiJS.Color;
var Piece = ShogiJS.Piece;
var Shogi = ShogiJS.Shogi;
var Normalizer = require('./normalizer');
var kifParser = require("../out/kif-parser");
var ki2Parser = require("../out/ki2-parser");
var csaParser = require("../out/csa-parser");
var JKFPlayer = (function () {
    function JKFPlayer(kifu) {
        this.shogi = new Shogi(kifu.initial || undefined);
        this.initialize(kifu);
    }
    JKFPlayer.log = function () {
        var lg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lg[_i - 0] = arguments[_i];
        }
        if (JKFPlayer.debug) {
            console.log(lg);
        }
        else {
            JKFPlayer._log.push(lg);
        }
    };
    JKFPlayer.prototype.initialize = function (kifu) {
        this.kifu = kifu;
        this.tesuu = 0;
        this.forks = [{ te: 0, moves: this.kifu.moves }];
    };
    JKFPlayer.parse = function (kifu, filename) {
        if (filename) {
            var tmp = filename.split("."), ext = tmp[tmp.length - 1].toLowerCase();
            switch (ext) {
                case "jkf":
                    return JKFPlayer.parseJKF(kifu);
                case "kif":
                case "kifu":
                    return JKFPlayer.parseKIF(kifu);
                case "ki2":
                case "ki2u":
                    return JKFPlayer.parseKI2(kifu);
                case "csa":
                    return JKFPlayer.parseCSA(kifu);
            }
        }
        // 不明
        try {
            return JKFPlayer.parseJKF(kifu);
        }
        catch (e) {
            JKFPlayer.log("failed to parse as jkf", e);
        }
        try {
            return JKFPlayer.parseKIF(kifu);
        }
        catch (e) {
            JKFPlayer.log("failed to parse as kif", e);
        }
        try {
            return JKFPlayer.parseKI2(kifu);
        }
        catch (e) {
            JKFPlayer.log("failed to parse as ki2", e);
        }
        try {
            return JKFPlayer.parseCSA(kifu);
        }
        catch (e) {
            JKFPlayer.log("failed to parse as csa", e);
        }
        throw "JKF, KIF, KI2, CSAいずれの形式でも失敗しました";
    };
    JKFPlayer.parseJKF = function (kifu) {
        JKFPlayer.log("parseJKF", kifu);
        return new JKFPlayer(JSON.parse(kifu));
    };
    JKFPlayer.parseKIF = function (kifu) {
        JKFPlayer.log("parseKIF", kifu);
        return new JKFPlayer(Normalizer.normalizeKIF(kifParser.parse(kifu)));
    };
    JKFPlayer.parseKI2 = function (kifu) {
        JKFPlayer.log("parseKI2", kifu);
        return new JKFPlayer(Normalizer.normalizeKI2(ki2Parser.parse(kifu)));
    };
    JKFPlayer.parseCSA = function (kifu) {
        JKFPlayer.log("parseCSA", kifu);
        return new JKFPlayer(Normalizer.normalizeCSA(csaParser.parse(kifu)));
    };
    JKFPlayer.numToZen = function (n) {
        return "０１２３４５６７８９"[n];
    };
    JKFPlayer.numToKan = function (n) {
        return "〇一二三四五六七八九"[n];
    };
    JKFPlayer.kindToKan = function (kind) {
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
            "RY": "龍"
        }[kind];
    };
    JKFPlayer.relativeToKan = function (relative) {
        return {
            "L": "左",
            "C": "直",
            "R": "右",
            "U": "上",
            "M": "寄",
            "D": "引",
            "H": "打"
        }[relative];
    };
    JKFPlayer.specialToKan = function (special) {
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
            "ERROR": "エラー"
        }[special] || special;
    };
    JKFPlayer.moveToReadableKifu = function (mv) {
        if (mv.special) {
            return JKFPlayer.specialToKan(mv.special);
        }
        var move = mv.move;
        var ret = move.color ? "☗" : "☖";
        if (move.same) {
            ret += "同　";
        }
        else {
            ret += JKFPlayer.numToZen(move.to.x) + JKFPlayer.numToKan(move.to.y);
        }
        ret += JKFPlayer.kindToKan(move.piece);
        if (move.relative) {
            ret += move.relative.split("").map(JKFPlayer.relativeToKan).join("");
        }
        if (move.promote != null) {
            ret += move.promote ? "成" : "不成";
        }
        return ret;
    };
    JKFPlayer.doMove = function (shogi, move) {
        if (move.from) {
            shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
        }
        else {
            shogi.drop(move.to.x, move.to.y, move.piece, typeof move.color != "undefined" ? (move.color ? 0 : 1) : void 0);
        }
    };
    JKFPlayer.undoMove = function (shogi, move) {
        if (move.from) {
            shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
        }
        else {
            shogi.undrop(move.to.x, move.to.y);
        }
    };
    JKFPlayer.getState = function (shogi) {
        return {
            color: shogi.turn == 0,
            board: JKFPlayer.getBoardState(shogi),
            hands: JKFPlayer.getHandsState(shogi)
        };
    };
    // 1手進める
    JKFPlayer.prototype.forward = function () {
        if (!this.getMoveFormat(this.tesuu + 1))
            return false;
        this.tesuu++;
        var move = this.getMoveFormat(this.tesuu).move;
        if (!move)
            return true;
        JKFPlayer.log("forward", this.tesuu, move);
        this.doMove(move);
        return true;
    };
    // 1手戻す
    JKFPlayer.prototype.backward = function () {
        var _this = this;
        if (this.tesuu <= 0)
            return false;
        var move = this.getMoveFormat(this.tesuu).move;
        if (!move) {
            this.tesuu--;
            return true;
        }
        JKFPlayer.log("backward", this.tesuu - 1, move);
        this.undoMove(move);
        this.tesuu--;
        this.forks = this.forks.filter(function (fork) { return fork.te <= _this.tesuu; });
        return true;
    };
    // tesuu手目へ行く
    JKFPlayer.prototype.goto = function (tesuu) {
        var limit = 10000; // for safe
        if (this.tesuu < tesuu) {
            while (this.tesuu != tesuu && this.forward() && limit-- > 0)
                ;
        }
        else {
            while (this.tesuu != tesuu && this.backward() && limit-- > 0)
                ;
        }
        if (limit == 0)
            throw "tesuu overflows";
    };
    // tesuu手前後に移動する
    JKFPlayer.prototype.go = function (tesuu) {
        this.goto(this.tesuu + tesuu);
    };
    // 現在の局面から別れた分岐のうちnum番目の変化へ1つ進む
    JKFPlayer.prototype.forkAndForward = function (num) {
        this.forks.push({ te: this.tesuu + 1, moves: this.getMoveFormat(this.tesuu + 1).forks[num] });
        this.forward();
    };
    // 現在の局面から新しいかもしれない手を1手動かす．
    // 必要フィールドは，指し: from, to, promote(成れる場合のみ)．打ち: to, piece
    // 新しい手の場合，最終手であれば手を追加，そうでなければ分岐を追加
    // もしpromoteの可能性があればfalseを返して何もしない
    // 成功すればその局面に移動してtrueを返す．
    JKFPlayer.prototype.inputMove = function (move) {
        if (this.getMoveFormat().special)
            throw "終了局面へ棋譜を追加することは出来ません";
        if (move.from != null && move.promote == null) {
            var piece = this.shogi.get(move.from.x, move.from.y);
            if (!Piece.isPromoted(piece.kind) && Piece.canPromote(piece.kind) && (Normalizer.canPromote(move.from, piece.color) || Normalizer.canPromote(move.to, piece.color)))
                return false;
        }
        var nextMove = this.getMoveFormat(this.tesuu + 1);
        if (nextMove) {
            if (nextMove.move && JKFPlayer.sameMoveMinimal(nextMove.move, move)) {
                // 次の一手と一致
                this.forward();
                return true;
            }
            if (nextMove.forks) {
                for (var i = 0; i < nextMove.forks.length; i++) {
                    var forkCand = nextMove.forks[i][0];
                    if (forkCand && forkCand.move && JKFPlayer.sameMoveMinimal(forkCand.move, move)) {
                        // 分岐と一致
                        this.forkAndForward(i);
                        return true;
                    }
                }
            }
        }
        this.doMove(move); //動かしてみる(throwされうる)
        var newMove = { move: move };
        var addToFork = this.tesuu < this.getMaxTesuu();
        if (addToFork) {
            // 最終手でなければ分岐に追加
            var next = this.getMoveFormat(this.tesuu + 1);
            if (!next.forks)
                next.forks = [];
            next.forks.push([newMove]);
        }
        else {
            // 最終手に追加
            this.forks[this.forks.length - 1].moves.push(newMove);
        }
        Normalizer.normalizeMinimal(this.kifu); // 復元
        this.undoMove(move);
        // 考え改めて再生
        if (addToFork) {
            this.forkAndForward(next.forks.length - 1);
        }
        else {
            this.forward();
        }
        return true;
    };
    // wrapper
    JKFPlayer.prototype.getBoard = function (x, y) {
        return this.shogi.get(x, y);
    };
    JKFPlayer.prototype.getComments = function (tesuu) {
        if (tesuu === void 0) { tesuu = this.tesuu; }
        return this.getMoveFormat(tesuu).comments || [];
    };
    JKFPlayer.prototype.getMove = function (tesuu) {
        if (tesuu === void 0) { tesuu = this.tesuu; }
        return this.getMoveFormat(tesuu).move;
    };
    JKFPlayer.prototype.getReadableKifu = function (tesuu) {
        if (tesuu === void 0) { tesuu = this.tesuu; }
        if (tesuu == 0)
            return "開始局面";
        return JKFPlayer.moveToReadableKifu(this.getMoveFormat(tesuu));
    };
    JKFPlayer.prototype.getReadableForkKifu = function (tesuu) {
        if (tesuu === void 0) { tesuu = this.tesuu; }
        return this.getNextFork(tesuu).map(function (fork) { return JKFPlayer.moveToReadableKifu(fork[0]); });
    };
    JKFPlayer.prototype.getMaxTesuu = function () {
        var nearestFork = this.forks[this.forks.length - 1];
        return nearestFork.te + nearestFork.moves.length - 1;
    };
    JKFPlayer.prototype.toJKF = function () {
        return JSON.stringify(this.kifu);
    };
    // jkf.initial.dataの形式を得る
    JKFPlayer.prototype.getState = function () {
        return JKFPlayer.getState(this.shogi);
    };
    JKFPlayer.prototype.getReadableKifuState = function () {
        var ret = [];
        for (var i = 0; i <= this.getMaxTesuu(); i++) {
            ret.push({ kifu: this.getReadableKifu(i), forks: this.getReadableForkKifu(i - 1), comments: this.getComments(i) });
        }
        return ret;
    };
    // private
    // 現在の局面から分岐を遡った初手から，現在の局面からの本譜の中から棋譜を得る
    JKFPlayer.prototype.getMoveFormat = function (tesuu) {
        if (tesuu === void 0) { tesuu = this.tesuu; }
        for (var i = this.forks.length - 1; i >= 0; i--) {
            var fork = this.forks[i];
            if (fork.te <= tesuu) {
                return fork.moves[tesuu - fork.te];
            }
        }
        throw "指定した手数が異常です";
    };
    JKFPlayer.prototype.getNextFork = function (tesuu) {
        if (tesuu === void 0) { tesuu = this.tesuu; }
        var next = this.getMoveFormat(tesuu + 1);
        return (next && next.forks) ? next.forks : [];
    };
    JKFPlayer.prototype.doMove = function (move) {
        JKFPlayer.doMove(this.shogi, move);
    };
    JKFPlayer.prototype.undoMove = function (move) {
        JKFPlayer.undoMove(this.shogi, move);
    };
    JKFPlayer.sameMoveMinimal = function (move1, move2) {
        return (move1.to.x == move2.to.x && move1.to.y == move2.to.y
            && (move1.from
                ? move1.from.x == move2.from.x && move1.from.y == move2.from.y && move1.promote == move2.promote
                : move1.piece == move2.piece));
    };
    JKFPlayer.getBoardState = function (shogi) {
        var ret = [];
        for (var i = 1; i <= 9; i++) {
            var arr = [];
            for (var j = 1; j <= 9; j++) {
                var piece = shogi.get(i, j);
                arr.push(piece ? { color: piece.color, kind: piece.kind } : {});
            }
            ret.push(arr);
        }
        return ret;
    };
    JKFPlayer.getHandsState = function (shogi) {
        return [
            shogi.getHandsSummary(Color.Black),
            shogi.getHandsSummary(Color.White),
        ];
    };
    JKFPlayer.debug = false;
    JKFPlayer._log = [];
    return JKFPlayer;
})();
module.exports = JKFPlayer;

},{"../node_modules/shogi.js/lib/shogi":3,"../out/csa-parser":4,"../out/ki2-parser":5,"../out/kif-parser":6,"./normalizer":1}],3:[function(require,module,exports){
/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function (Color) {
    Color[Color["Black"] = 0] = "Black";
    Color[Color["White"] = 1] = "White";
})(exports.Color || (exports.Color = {}));
var Color = exports.Color;
var Shogi = (function () {
    function Shogi(setting) {
        this.initialize(setting);
    }
    // 盤面を初期化する
    // 初期局面(なければ平手)
    Shogi.prototype.initialize = function (setting) {
        if (setting === void 0) { setting = { preset: "HIRATE" }; }
        this.board = [];
        if (setting.preset != "OTHER") {
            for (var i = 0; i < 9; i++) {
                this.board[i] = [];
                for (var j = 0; j < 9; j++) {
                    var csa = Shogi.preset[setting.preset].board[j].slice(24 - i * 3, 24 - i * 3 + 3);
                    this.board[i][j] = csa == " * " ? null : new Piece(csa);
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
                    this.board[i][j] = p.kind ? new Piece((p.color ? "+" : ":") + p.kind) : null;
                }
            }
            this.turn = setting.data.color ? Color.Black : Color.White;
            this.hands = [[], []];
            for (var c = 0; c < 2; c++) {
                for (var k in setting.data.hands[c]) {
                    var csa = (c == 0 ? "+" : "-") + k;
                    for (var i = 0; i < setting.data.hands[c][k]; i++) {
                        this.hands[c].push(new Piece(csa));
                    }
                }
            }
        }
        this.flagEditMode = false;
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
        if (piece == null)
            throw "no piece found at " + fromx + ", " + fromy;
        this.checkTurn(piece.color);
        if (!this.flagEditMode) {
            if (!this.getMovesFrom(fromx, fromy).some(function (move) {
                return move.to.x == tox && move.to.y == toy;
            }))
                throw "cannot move from " + fromx + ", " + fromy + " to " + tox + ", " + toy;
        }
        if (this.get(tox, toy) != null)
            this.capture(tox, toy);
        if (promote)
            piece.promote();
        this.set(tox, toy, piece);
        this.set(fromx, fromy, null);
        this.nextTurn();
    };
    // moveの逆を行う．つまり(tox, toy)から(fromx, fromy)へ移動し，駒を取っていたら戻し，promoteなら成りを戻す．
    Shogi.prototype.unmove = function (fromx, fromy, tox, toy, promote, capture) {
        if (promote === void 0) { promote = false; }
        var piece = this.get(tox, toy);
        if (piece == null)
            throw "no piece found at " + tox + ", " + toy;
        this.checkTurn(Piece.oppositeColor(piece.color));
        var captured;
        if (capture) {
            captured = this.popFromHand(Piece.unpromote(capture), piece.color);
            captured.inverse();
        }
        var editMode = this.flagEditMode;
        this.editMode(true);
        this.move(tox, toy, fromx, fromy);
        if (promote)
            piece.unpromote();
        if (capture) {
            if (Piece.isPromoted(capture))
                captured.promote();
            this.set(tox, toy, captured);
        }
        this.editMode(editMode);
        this.prevTurn();
    };
    // (tox, toy)へcolorの持ち駒のkindを打つ．
    Shogi.prototype.drop = function (tox, toy, kind, color) {
        if (color === void 0) { color = this.turn; }
        this.checkTurn(color);
        if (this.get(tox, toy) != null)
            throw "there is a piece at " + tox + ", " + toy;
        var piece = this.popFromHand(kind, color);
        this.set(tox, toy, piece);
        this.nextTurn();
    };
    // dropの逆を行う，つまり(tox, toy)の駒を駒台に戻す．
    Shogi.prototype.undrop = function (tox, toy) {
        var piece = this.get(tox, toy);
        if (piece == null)
            throw "there is no piece at " + tox + ", " + toy;
        this.checkTurn(Piece.oppositeColor(piece.color));
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
            for (var j = 0; j < this.hands[i].length; j++) {
                line += "00" + this.hands[i][j].kind;
            }
            ret.push(line);
        }
        ret.push(this.turn == Color.Black ? "+" : "-");
        return ret.join("\n");
    };
    // (x, y)の駒の移動可能な動きをすべて得る
    // 盤外，自分の駒取りは除外．二歩，王手放置などはチェックせず．
    Shogi.prototype.getMovesFrom = function (x, y) {
        // 盤外かもしれない(x, y)にcolorの駒が移動しても問題がないか
        var legal = function (x, y, color) {
            if (x < 1 || 9 < x || y < 1 || 9 < y)
                return false;
            var piece = this.get(x, y);
            return piece == null || piece.color != color;
        }.bind(this);
        var shouldStop = function (x, y, color) {
            var piece = this.get(x, y);
            return piece != null && piece.color != color;
        }.bind(this);
        var piece = this.get(x, y);
        if (piece == null)
            return [];
        var moveDef = Piece.getMoveDef(piece.kind);
        var ret = [], from = { x: x, y: y };
        if (moveDef.just) {
            for (var i = 0; i < moveDef.just.length; i++) {
                var def = moveDef.just[i];
                if (piece.color == Color.White) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                var to = { x: from.x + def[0], y: from.y + def[1] };
                if (legal(to.x, to.y, piece.color))
                    ret.push({ from: from, to: to });
            }
        }
        if (moveDef.fly) {
            for (var i = 0; i < moveDef.fly.length; i++) {
                var def = moveDef.fly[i];
                if (piece.color == Color.White) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                var to = { x: from.x + def[0], y: from.y + def[1] };
                while (legal(to.x, to.y, piece.color)) {
                    ret.push({ from: from, to: { x: to.x, y: to.y } });
                    if (shouldStop(to.x, to.y, piece.color))
                        break;
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
        for (var i = 1; i <= 9; i++) {
            for (var j = 1; j <= 9; j++) {
                if (this.get(i, j) == null)
                    places.push({ x: i, y: j });
            }
        }
        var done = {};
        for (var i = 0; i < this.hands[color].length; i++) {
            var kind = this.hands[color][i].kind;
            if (done[kind])
                continue;
            done[kind] = true;
            for (var j = 0; j < places.length; j++) {
                ret.push({ to: places[j], color: color, kind: kind });
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
                if (!piece || piece.kind != kind || piece.color != color)
                    continue;
                var moves = this.getMovesFrom(i, j);
                if (moves.some(function (move) { return move.to.x == x && move.to.y == y; })) {
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
            "FU": 0,
            "KY": 0,
            "KE": 0,
            "GI": 0,
            "KI": 0,
            "KA": 0,
            "HI": 0
        };
        for (var i = 0; i < this.hands[color].length; i++) {
            ret[this.hands[color][i].kind]++;
        }
        return ret;
    };
    // 以下editModeでの関数
    // (x, y)の駒を取ってcolorの持ち駒に加える
    Shogi.prototype.captureByColor = function (x, y, color) {
        if (!this.flagEditMode)
            throw "cannot edit board without editMode";
        var piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        if (piece.color != color)
            piece.inverse();
        this.pushToHand(piece);
    };
    // (x, y)の駒をフリップする(先手→先手成→後手→後手成→)
    // 成功したらtrueを返す
    Shogi.prototype.flip = function (x, y) {
        if (!this.flagEditMode)
            throw "cannot edit board without editMode";
        var piece = this.get(x, y);
        if (!piece)
            return false;
        if (Piece.isPromoted(piece.kind)) {
            piece.unpromote();
            piece.inverse();
        }
        else if (Piece.canPromote(piece.kind)) {
            piece.promote();
        }
        else {
            piece.inverse();
        }
        return true;
    };
    // 手番を設定する
    Shogi.prototype.setTurn = function (color) {
        if (!this.flagEditMode)
            throw "cannot set turn without editMode";
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
            if (hand[i].kind != kind)
                continue;
            var piece = hand[i];
            hand.splice(i, 1); // remove at i
            return piece;
        }
        throw color + " has no " + kind;
    };
    // 次の手番に行く
    Shogi.prototype.nextTurn = function () {
        if (this.flagEditMode)
            return;
        this.turn = this.turn == Color.Black ? Color.White : Color.Black;
    };
    // 前の手番に行く
    Shogi.prototype.prevTurn = function () {
        if (this.flagEditMode)
            return;
        this.nextTurn();
    };
    // colorの手番で問題ないか確認する．編集モードならok．
    Shogi.prototype.checkTurn = function (color) {
        if (!this.flagEditMode && color != this.turn)
            throw "cannot move opposite piece";
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
            turn: Color.Black
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
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
            turn: Color.White
        }
    };
    return Shogi;
})();
exports.Shogi = Shogi;
// enum Kind {HI, KY, KE, GI, KI, KA, HI, OU, TO, NY, NK, NG, UM, RY}
var Piece = (function () {
    // "+FU"などのCSAによる駒表現から駒オブジェクトを作成
    function Piece(csa) {
        this.color = csa.slice(0, 1) == "+" ? Color.Black : Color.White;
        this.kind = csa.slice(1);
    }
    // 成る
    Piece.prototype.promote = function () {
        this.kind = Piece.promote(this.kind);
    };
    // 不成にする
    Piece.prototype.unpromote = function () {
        this.kind = Piece.unpromote(this.kind);
    };
    // 駒の向きを反転する
    Piece.prototype.inverse = function () {
        this.color = this.color == Color.Black ? Color.White : Color.Black;
    };
    // CSAによる駒表現の文字列を返す
    Piece.prototype.toCSAString = function () {
        return (this.color == Color.Black ? "+" : "-") + this.kind;
    };
    // 成った時の種類を返す．なければそのまま．
    Piece.promote = function (kind) {
        return {
            FU: "TO",
            KY: "NY",
            KE: "NK",
            GI: "NG",
            KA: "UM",
            HI: "RY"
        }[kind] || kind;
    };
    // 表に返した時の種類を返す．表の場合はそのまま．
    Piece.unpromote = function (kind) {
        return {
            TO: "FU",
            NY: "KY",
            NK: "KE",
            NG: "GI",
            KI: "KI",
            UM: "KA",
            RY: "HI",
            OU: "OU"
        }[kind] || kind;
    };
    // 成れる駒かどうかを返す
    Piece.canPromote = function (kind) {
        return Piece.promote(kind) != kind;
    };
    Piece.getMoveDef = function (kind) {
        switch (kind) {
            case "FU":
                return { just: [[0, -1],] };
            case "KY":
                return { fly: [[0, -1],] };
            case "KE":
                return { just: [[-1, -2], [1, -2],] };
            case "GI":
                return { just: [[-1, -1], [0, -1], [1, -1], [-1, 1], [1, 1],] };
            case "KI":
            case "TO":
            case "NY":
            case "NK":
            case "NG":
                return { just: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] };
            case "KA":
                return { fly: [[-1, -1], [1, -1], [-1, 1], [1, 1],] };
            case "HI":
                return { fly: [[0, -1], [-1, 0], [1, 0], [0, 1]] };
            case "OU":
                return { just: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] };
            case "UM":
                return { fly: [[-1, -1], [1, -1], [-1, 1], [1, 1],], just: [[0, -1], [-1, 0], [1, 0], [0, 1]] };
            case "RY":
                return { fly: [[0, -1], [-1, 0], [1, 0], [0, 1]], just: [[-1, -1], [1, -1], [-1, 1], [1, 1],] };
        }
    };
    Piece.isPromoted = function (kind) {
        return ["TO", "NY", "NK", "NG", "UM", "RY"].indexOf(kind) >= 0;
    };
    Piece.oppositeColor = function (color) {
        return color == Color.Black ? Color.White : Color.Black;
    };
    return Piece;
})();
exports.Piece = Piece;

},{}],4:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { kifu: peg$parsekifu },
        peg$startRuleFunction  = peg$parsekifu,

        peg$c0 = peg$FAILED,
        peg$c1 = null,
        peg$c2 = function(i, ini, ms) {
        	var ret = {header:i.header, initial:ini, moves:ms}
        	if(i && i.players){
        		if(i.players[0]) ret.header["先手"]=i.players[0];
        		if(i.players[1]) ret.header["後手"]=i.players[1];
        	}
        	return ret;
        },
        peg$c3 = [],
        peg$c4 = "V2.2",
        peg$c5 = { type: "literal", value: "V2.2", description: "\"V2.2\"" },
        peg$c6 = function(players, header) {return {players:players, header:header}},
        peg$c7 = function(header) {
        	var ret = {};
        	for(var i=0; i<header.length; i++){
        		ret[header[i].k]=header[i].v;
        	}
        	return ret;
        },
        peg$c8 = "$",
        peg$c9 = { type: "literal", value: "$", description: "\"$\"" },
        peg$c10 = /^[^:]/,
        peg$c11 = { type: "class", value: "[^:]", description: "[^:]" },
        peg$c12 = ":",
        peg$c13 = { type: "literal", value: ":", description: "\":\"" },
        peg$c14 = function(k, v) {return {k:k.join(""), v:v.join("")}},
        peg$c15 = function(p, ini, ms) {
        	var ret = {header: {}, initial:ini, moves:ms}
        	if(p){
        		if(p[0]) ret.header["先手"] = p[0];
        		if(p[1]) ret.header["後手"] = p[1];
        	}
        	return ret;
        },
        peg$c16 = "N+",
        peg$c17 = { type: "literal", value: "N+", description: "\"N+\"" },
        peg$c18 = function(n) { return n },
        peg$c19 = "N-",
        peg$c20 = { type: "literal", value: "N-", description: "\"N-\"" },
        peg$c21 = function(n) { return n},
        peg$c22 = function(sen, go) { return [sen?sen.join(""):null, go?go.join(""):null] },
        peg$c23 = "",
        peg$c24 = function() {return "NO"},
        peg$c25 = function(data, koma, teban) {
        	if(data=="NO"){
        		data = koma;
        	}else{
        		data.data.hands = koma.data.hands;
        	}
        	data.data.color=teban;
        	return data;
        },
        peg$c26 = "PI",
        peg$c27 = { type: "literal", value: "PI", description: "\"PI\"" },
        peg$c28 = function(ps) {
        //	if(ps.length==0) return {preset: "HIRATE"};
        	var ret = {preset: "OTHER", data: {board: getHirate()}};
        	for(var i=0; i<ps.length; i++){
        		ret.data.board[ps[i].xy.x-1][ps[i].xy.y-1]={};
        	}
        	return ret;
        },
        peg$c29 = function(lines) {
        	var ret = [];
        	for(var i=0; i<9; i++){
        		var line = [];
        		for(var j=0; j<9; j++){
        			line.push(lines[j][8-i]);
        		}
        		ret.push(line);
        	}
        	return {preset: "OTHER", data: {board:ret}};
        },
        peg$c30 = "P",
        peg$c31 = { type: "literal", value: "P", description: "\"P\"" },
        peg$c32 = /^[1-9]/,
        peg$c33 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c34 = function(masu) { return masu; },
        peg$c35 = function(c, k) {return {color:c, kind:k}},
        peg$c36 = " * ",
        peg$c37 = { type: "literal", value: " * ", description: "\" * \"" },
        peg$c38 = function() { return {} },
        peg$c39 = function(lines) {
        	var board=[];
        	var hands=[{}, {}];
        	for(var i=0; i<9; i++){
        		var line=[];
        		for(var j=0; j<9; j++){
        			line.push({});
        		}
        		board.push(line);
        	}
        	for(var i=0; i<lines.length; i++){
        		for(var j=0; j<lines[i].pieces.length; j++){
        			var p = lines[i].pieces[j];
        			if(p.xy.x==0){
        				// 持ち駒
        				var obj=hands[lines[i].teban?0:1];
        				if(!obj[p.piece]) obj[p.piece]=0;
        				obj[p.piece]++;
        			}else{
        				// 盤上
        				board[p.xy.x-1][p.xy.y-1] = {color: lines[i].teban, kind: p.piece};
        			}
        		}
        	}
        	return {preset: "OTHER", data: {board: board, hands: hands}}
        },
        peg$c40 = function(teban, pieces) {return {teban: teban, pieces: pieces}},
        peg$c41 = function(hd, tl) {tl.unshift(hd); return tl;},
        peg$c42 = function(c) {return {comments:c}},
        peg$c43 = function(move, time, comment) { var ret = {comments:comment}; if(time){ret.time=time;}if(move.special){ret.special=move.special}else{ret.move=move}; return ret; },
        peg$c44 = function(from, to, piece) { return {from:from.x==0?null:from, to:to, piece:piece}},
        peg$c45 = "%",
        peg$c46 = { type: "literal", value: "%", description: "\"%\"" },
        peg$c47 = /^[\-+_A-Z]/,
        peg$c48 = { type: "class", value: "[\\-+_A-Z]", description: "[\\-+_A-Z]" },
        peg$c49 = function(m) { return {special: m.join("")}; },
        peg$c50 = "+",
        peg$c51 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c52 = function() {return true},
        peg$c53 = "-",
        peg$c54 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c55 = function() {return false},
        peg$c56 = "'",
        peg$c57 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c58 = function(c) { return c.join(""); },
        peg$c59 = "T",
        peg$c60 = { type: "literal", value: "T", description: "\"T\"" },
        peg$c61 = /^[0-9]/,
        peg$c62 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c63 = function(t) { return {now: secToTime(parseInt(t.join("")))}; },
        peg$c64 = function(x, y) { return {x:parseInt(x), y:parseInt(y)}; },
        peg$c65 = /^[A-Z]/,
        peg$c66 = { type: "class", value: "[A-Z]", description: "[A-Z]" },
        peg$c67 = function(a, b) { return a+b; },
        peg$c68 = function(xy, piece) {return {xy:xy, piece:piece}},
        peg$c69 = "\r",
        peg$c70 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c71 = "\n",
        peg$c72 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c73 = " ",
        peg$c74 = { type: "literal", value: " ", description: "\" \"" },
        peg$c75 = ",",
        peg$c76 = { type: "literal", value: ",", description: "\",\"" },
        peg$c77 = /^[^\r\n]/,
        peg$c78 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsekifu() {
      var s0;

      s0 = peg$parsecsa2();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecsa1();
      }

      return s0;
    }

    function peg$parsecsa2() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseversion22();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinformation();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseinitialboard();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemoves();
            if (s4 === peg$FAILED) {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c2(s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseversion22() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c4) {
          s2 = peg$c4;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c5); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseinformation() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseplayers();
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseheaders();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseheaders() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseheader();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseheader();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c7(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseheader() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 36) {
          s2 = peg$c8;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c9); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c10.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c10.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c11); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c12;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parsenonl();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parsenonl();
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsenl();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c14(s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecsa1() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseplayers();
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinitialboard();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsemoves();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c15(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseplayers() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c16) {
          s3 = peg$c16;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsenonl();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsenonl();
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenl();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s2;
              s3 = peg$c18(s4);
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsecomment();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsecomment();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c19) {
              s5 = peg$c19;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c20); }
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$parsenonl();
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$parsenonl();
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsenl();
                if (s7 !== peg$FAILED) {
                  peg$reportedPos = s4;
                  s5 = peg$c21(s6);
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c22(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseinitialboard() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsehirate();
        if (s2 === peg$FAILED) {
          s2 = peg$parseikkatsu();
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$c23;
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s2;
              s3 = peg$c24();
            }
            s2 = s3;
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsekomabetsu();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsecomment();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parsecomment();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseteban();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsenl();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c25(s2, s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsehirate() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c26) {
        s1 = peg$c26;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsexypiece();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsexypiece();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c28(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseikkatsu() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseikkatsuline();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseikkatsuline();
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c29(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseikkatsuline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 80) {
        s1 = peg$c30;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c32.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c33); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsemasu();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsemasu();
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsenl();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c34(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemasu() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseteban();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c36) {
          s1 = peg$c36;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c38();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsekomabetsu() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsekomabetsuline();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsekomabetsuline();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c39(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsekomabetsuline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 80) {
        s1 = peg$c30;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseteban();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsexypiece();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsexypiece();
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsenl();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c40(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemoves() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsefirstboard();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemove();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsemove();
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsecomment();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsecomment();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c41(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefirstboard() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c42(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemove() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsenormalmove();
      if (s1 === peg$FAILED) {
        s1 = peg$parsespecialmove();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetime();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsecomment();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsecomment();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c43(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenormalmove() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseteban();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsexy();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsexy();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsepiece();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c44(s2, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsespecialmove() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 37) {
        s1 = peg$c45;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c46); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c47.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c47.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c49(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseteban() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 43) {
        s1 = peg$c50;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c52();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c53;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c55();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c58(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsetime() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 84) {
        s1 = peg$c59;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c60); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c61.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c62); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c61.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c62); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c63(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsexy() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (peg$c61.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c62); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c61.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c62); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c64(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepiece() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (peg$c65.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c65.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c66); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c67(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsexypiece() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsexy();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c68(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenl() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 13) {
        s1 = peg$c69;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c70); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c71;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c72); }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c73;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c73;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c74); }
          }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s2 = peg$c75;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsenonl() {
      var s0;

      if (peg$c77.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c78); }
      }

      return s0;
    }


    	function secToTime(sec){
    		var remain, h, m, s = sec%60;
    		remain = (sec-s)/60;
    		m = remain%60;
    		remain = (remain - m)/60;
    		return {h:remain, m:m, s:s};
    	}
    	function getHirate(){
    		return [
    			[{color:false,kind:"KY"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KY"},],
    			[{color:false,kind:"KE"},{color:false,kind:"KA"},{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{color:true,kind:"HI"},{color:true,kind:"KE"},],
    			[{color:false,kind:"GI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"GI"},],
    			[{color:false,kind:"KI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KI"},],
    			[{color:false,kind:"OU"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"OU"},],
    			[{color:false,kind:"KI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KI"},],
    			[{color:false,kind:"GI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"GI"},],
    			[{color:false,kind:"KE"},{color:false,kind:"HI"},{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{color:true,kind:"KA"},{color:true,kind:"KE"},],
    			[{color:false,kind:"KY"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KY"},],
    		];
    	}


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
},{}],5:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { kifu: peg$parsekifu },
        peg$startRuleFunction  = peg$parsekifu,

        peg$c0 = peg$FAILED,
        peg$c1 = [],
        peg$c2 = null,
        peg$c3 = function(headers, ini, headers2, moves, forks) {
         	var ret = {header:{}, moves:moves};
        	for(var i=0; i<headers.length; i++){
        		ret.header[headers[i].k]=headers[i].v;
        	}
        	for(var i=0; i<headers2.length; i++){
        		ret.header[headers2[i].k]=headers2[i].v;
        	}
        	if(ini){
        		ret.initial = ini;
        	}else if(ret.header["手合割"]){
        		var preset = presetToString(ret.header["手合割"]);
        		if(preset!="OTHER") ret.initial={preset: preset};
        	}
        	if(ret.initial && ret.initial.data){
        		if(ret.header["手番"]){
        			ret.initial.data.color="下先".indexOf(ret.header["手番"])>=0 ? true : false;
        		}else{
        			ret.initial.data.color = true;
        		}
        		ret.initial.data.hands = [{}, {}];
        		if(ret.header["先手の持駒"] || ret.header["下手の持駒"]){
        			ret.initial.data.hands[0] = makeHand(ret.header["先手の持駒"] || ret.header["下手の持駒"]);
        			delete ret.header["先手の持駒"];
        			delete ret.header["下手の持駒"];
        		}
        		if(ret.header["後手の持駒"] || ret.header["上手の持駒"]){
        			ret.initial.data.hands[1] = makeHand(ret.header["後手の持駒"] || ret.header["上手の持駒"]);
        			delete ret.header["先手の持駒"];
        			delete ret.header["下手の持駒"];
        		}
        	}
        	var forkStack = [{te:0, moves:moves}];
        	for(var i=0; i<forks.length; i++){
        		var nowFork = forks[i];
        		var fork = forkStack.pop();
        		while(fork.te>nowFork.te){fork = forkStack.pop();}
        		var move = fork.moves[nowFork.te-fork.te];
        		move.forks = move.forks || [];
        		move.forks.push(nowFork.moves);
        		forkStack.push(fork);
        		forkStack.push(nowFork);
        	}
        	return ret;
        },
        peg$c4 = /^[^\uFF1A\r\n]/,
        peg$c5 = { type: "class", value: "[^\\uFF1A\\r\\n]", description: "[^\\uFF1A\\r\\n]" },
        peg$c6 = "\uFF1A",
        peg$c7 = { type: "literal", value: "\uFF1A", description: "\"\\uFF1A\"" },
        peg$c8 = function(key, value) {return {k:key.join(""), v:value.join("")}},
        peg$c9 = /^[\u5148\u5F8C\u4E0A\u4E0B]/,
        peg$c10 = { type: "class", value: "[\\u5148\\u5F8C\\u4E0A\\u4E0B]", description: "[\\u5148\\u5F8C\\u4E0A\\u4E0B]" },
        peg$c11 = "\u624B\u756A",
        peg$c12 = { type: "literal", value: "\u624B\u756A", description: "\"\\u624B\\u756A\"" },
        peg$c13 = function(te) {return {k:"手番",v:te}},
        peg$c14 = " ",
        peg$c15 = { type: "literal", value: " ", description: "\" \"" },
        peg$c16 = "+",
        peg$c17 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c18 = function(lines) {
        	var ret = [];
        	for(var i=0; i<9; i++){
        		var line = [];
        		for(var j=0; j<9; j++){
        			line.push(lines[j][8-i]);
        		}
        		ret.push(line);
        	}
        	return {preset: "OTHER", data: {board:ret}};
        },
        peg$c19 = "|",
        peg$c20 = { type: "literal", value: "|", description: "\"|\"" },
        peg$c21 = function(masu) { return masu; },
        peg$c22 = function(c, k) {return {color:c, kind:k}},
        peg$c23 = " \u30FB",
        peg$c24 = { type: "literal", value: " \u30FB", description: "\" \\u30FB\"" },
        peg$c25 = function() { return {} },
        peg$c26 = "^",
        peg$c27 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c28 = function() {return true},
        peg$c29 = "v",
        peg$c30 = { type: "literal", value: "v", description: "\"v\"" },
        peg$c31 = "V",
        peg$c32 = { type: "literal", value: "V", description: "\"V\"" },
        peg$c33 = function() {return false},
        peg$c34 = function(hd, tl, res) {
        	tl.unshift(hd);
        	if(res && !tl[tl.length-1].special){
        		tl.push({special: res});
        	}
        	return tl;
        },
        peg$c35 = function(c) {return c.length==0 ? {} : {comments:c}},
        peg$c36 = function(line, c) {
        	var ret = {move: line};
        	if(c.length>0) ret.comments=cl;
        	return ret;
        },
        peg$c37 = "&",
        peg$c38 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c39 = /^[\u25B2\u25B3]/,
        peg$c40 = { type: "class", value: "[\\u25B2\\u25B3]", description: "[\\u25B2\\u25B3]" },
        peg$c41 = function(f) {return f},
        peg$c42 = "\u6210",
        peg$c43 = { type: "literal", value: "\u6210", description: "\"\\u6210\"" },
        peg$c44 = "\u4E0D\u6210",
        peg$c45 = { type: "literal", value: "\u4E0D\u6210", description: "\"\\u4E0D\\u6210\"" },
        peg$c46 = "\u6253",
        peg$c47 = { type: "literal", value: "\u6253", description: "\"\\u6253\"" },
        peg$c48 = function(pl, pi, sou, dou, pro, da) {
        	var ret = {piece: pi};
        	if(pl.same){
        		ret.same = true;
        	}else{
        		ret.to = pl;
        	}
        	if(pro)ret.promote=pro=="成";
        	if(da){
        		ret.relative = "H";
        	}else{
        		var rel = soutaiToRelative(sou)+dousaToRelative(dou);
        		if(rel!="") ret.relative=rel;
        	}
        	return ret;
        },
        peg$c49 = function(x, y) {return {x:x,y:y}},
        peg$c50 = "\u540C",
        peg$c51 = { type: "literal", value: "\u540C", description: "\"\\u540C\"" },
        peg$c52 = "\u3000",
        peg$c53 = { type: "literal", value: "\u3000", description: "\"\\u3000\"" },
        peg$c54 = function() {return {same:true}},
        peg$c55 = /^[\u6B69\u9999\u6842\u9280\u91D1\u89D2\u98DB\u738B\u7389\u3068\u674F\u572D\u5168\u99AC\u7ADC\u9F8D]/,
        peg$c56 = { type: "class", value: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]", description: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]" },
        peg$c57 = function(pro, p) {return kindToCSA((pro||"")+p)},
        peg$c58 = /^[\u5DE6\u76F4\u53F3]/,
        peg$c59 = { type: "class", value: "[\\u5DE6\\u76F4\\u53F3]", description: "[\\u5DE6\\u76F4\\u53F3]" },
        peg$c60 = /^[\u4E0A\u5BC4\u5F15]/,
        peg$c61 = { type: "class", value: "[\\u4E0A\\u5BC4\\u5F15]", description: "[\\u4E0A\\u5BC4\\u5F15]" },
        peg$c62 = /^[\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]/,
        peg$c63 = { type: "class", value: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]", description: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]" },
        peg$c64 = function(n) {return zenToN(n);},
        peg$c65 = /^[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]/,
        peg$c66 = { type: "class", value: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]", description: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]" },
        peg$c67 = function(n) {return kanToN(n);},
        peg$c68 = "*",
        peg$c69 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c70 = function(comm) {return comm.join("")},
        peg$c71 = "\u307E\u3067",
        peg$c72 = { type: "literal", value: "\u307E\u3067", description: "\"\\u307E\\u3067\"" },
        peg$c73 = /^[0-9]/,
        peg$c74 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c75 = "\u624B",
        peg$c76 = { type: "literal", value: "\u624B", description: "\"\\u624B\"" },
        peg$c77 = "\u3067",
        peg$c78 = { type: "literal", value: "\u3067", description: "\"\\u3067\"" },
        peg$c79 = "\u624B\u306E",
        peg$c80 = { type: "literal", value: "\u624B\u306E", description: "\"\\u624B\\u306E\"" },
        peg$c81 = "\u52DD\u3061",
        peg$c82 = { type: "literal", value: "\u52DD\u3061", description: "\"\\u52DD\\u3061\"" },
        peg$c83 = function() {return "TORYO"},
        peg$c84 = "\u53CD\u5247",
        peg$c85 = { type: "literal", value: "\u53CD\u5247", description: "\"\\u53CD\\u5247\"" },
        peg$c86 = function() {return "ILLEGAL_ACTION"},
        peg$c87 = "\u8CA0\u3051",
        peg$c88 = { type: "literal", value: "\u8CA0\u3051", description: "\"\\u8CA0\\u3051\"" },
        peg$c89 = function() {return "ILLEGAL_MOVE"},
        peg$c90 = function(res) {return res},
        peg$c91 = function(win, res) {return res},
        peg$c92 = "\u3067\u6642\u9593\u5207\u308C\u306B\u3088\u308A",
        peg$c93 = { type: "literal", value: "\u3067\u6642\u9593\u5207\u308C\u306B\u3088\u308A", description: "\"\\u3067\\u6642\\u9593\\u5207\\u308C\\u306B\\u3088\\u308A\"" },
        peg$c94 = "\u624B\u306E\u52DD\u3061",
        peg$c95 = { type: "literal", value: "\u624B\u306E\u52DD\u3061", description: "\"\\u624B\\u306E\\u52DD\\u3061\"" },
        peg$c96 = function(win) {return "TIME_UP"},
        peg$c97 = "\u3067\u4E2D\u65AD",
        peg$c98 = { type: "literal", value: "\u3067\u4E2D\u65AD", description: "\"\\u3067\\u4E2D\\u65AD\"" },
        peg$c99 = function() {return "CHUDAN"},
        peg$c100 = "\u3067\u6301\u5C06\u68CB",
        peg$c101 = { type: "literal", value: "\u3067\u6301\u5C06\u68CB", description: "\"\\u3067\\u6301\\u5C06\\u68CB\"" },
        peg$c102 = function() {return "JISHOGI"},
        peg$c103 = "\u3067\u5343\u65E5\u624B",
        peg$c104 = { type: "literal", value: "\u3067\u5343\u65E5\u624B", description: "\"\\u3067\\u5343\\u65E5\\u624B\"" },
        peg$c105 = function() {return "SENNICHITE"},
        peg$c106 = "\u8A70",
        peg$c107 = { type: "literal", value: "\u8A70", description: "\"\\u8A70\"" },
        peg$c108 = "\u307F",
        peg$c109 = { type: "literal", value: "\u307F", description: "\"\\u307F\"" },
        peg$c110 = function() {return "TSUMI"},
        peg$c111 = "\u3067\u4E0D\u8A70",
        peg$c112 = { type: "literal", value: "\u3067\u4E0D\u8A70", description: "\"\\u3067\\u4E0D\\u8A70\"" },
        peg$c113 = function() {return "FUZUMI"},
        peg$c114 = "\u5909\u5316\uFF1A",
        peg$c115 = { type: "literal", value: "\u5909\u5316\uFF1A", description: "\"\\u5909\\u5316\\uFF1A\"" },
        peg$c116 = function(te, moves) {return {te:parseInt(te), moves:moves.slice(1)}},
        peg$c117 = "#",
        peg$c118 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c119 = "\t",
        peg$c120 = { type: "literal", value: "\t", description: "\"\\t\"" },
        peg$c121 = "\n",
        peg$c122 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c123 = "\r",
        peg$c124 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c125 = /^[^\r\n]/,
        peg$c126 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsekifu() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseheader();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseheader();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinitialboard();
        if (s2 === peg$FAILED) {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseheader();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseheader();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemoves();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parsefork();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parsefork();
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c3(s1, s2, s3, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseheader() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c4.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c5); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c4.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c5); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 65306) {
          s2 = peg$c6;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c7); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsenonl();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsenonl();
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsenl();
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsenl();
              }
            } else {
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c8(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (peg$c9.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c10); }
        }
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c11) {
            s2 = peg$c11;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c12); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenl();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c13(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parseinitialboard() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c14;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsenonl();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsenonl();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsenl();
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 43) {
          s3 = peg$c16;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsenonl();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsenonl();
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenl();
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseikkatsuline();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseikkatsuline();
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 43) {
              s5 = peg$c16;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c17); }
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$parsenonl();
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$parsenonl();
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsenl();
                if (s7 !== peg$FAILED) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c2;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c18(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseikkatsuline() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 124) {
        s1 = peg$c19;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemasu();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsemasu();
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 124) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsenonl();
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsenonl();
              }
            } else {
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c21(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemasu() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseteban();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c22(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c23) {
          s1 = peg$c23;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c25();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseteban() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c14;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s1 = peg$c16;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 94) {
            s1 = peg$c26;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c27); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c28();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 118) {
          s1 = peg$c29;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c30); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 86) {
            s1 = peg$c31;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c33();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsemoves() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsefirstboard();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemove();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsemove();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseresult();
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c34(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefirstboard() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepointer();
        if (s2 === peg$FAILED) {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemove() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseline();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsecomment();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsecomment();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsepointer();
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsenl();
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 32) {
                s5 = peg$c14;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c15); }
              }
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parsenl();
              if (s5 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 32) {
                  s5 = peg$c14;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c15); }
                }
              }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c36(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepointer() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 38) {
        s1 = peg$c37;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (peg$c39.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsefugou();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsenl();
          if (s4 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 32) {
              s4 = peg$c14;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c15); }
            }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsenl();
            if (s4 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 32) {
                s4 = peg$c14;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c15); }
              }
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c41(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefugou() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseplace();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesoutai();
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsedousa();
            if (s4 === peg$FAILED) {
              s4 = peg$c2;
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 25104) {
                s5 = peg$c42;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
              }
              if (s5 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c44) {
                  s5 = peg$c44;
                  peg$currPos += 2;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
                }
              }
              if (s5 === peg$FAILED) {
                s5 = peg$c2;
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 25171) {
                  s6 = peg$c46;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c47); }
                }
                if (s6 === peg$FAILED) {
                  s6 = peg$c2;
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c48(s1, s2, s3, s4, s5, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseplace() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsenum();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenumkan();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c49(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 21516) {
          s1 = peg$c50;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c51); }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 12288) {
            s2 = peg$c52;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c53); }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c54();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsepiece() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 25104) {
        s1 = peg$c42;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        if (peg$c55.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c56); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c57(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesoutai() {
      var s0;

      if (peg$c58.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c59); }
      }

      return s0;
    }

    function peg$parsedousa() {
      var s0;

      if (peg$c60.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
      }

      return s0;
    }

    function peg$parsenum() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c62.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c63); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c64(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenumkan() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c65.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c67(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c68;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c70(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseresult() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c71) {
        s1 = peg$c71;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c72); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c73.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c73.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c74); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 25163) {
            s3 = peg$c75;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 12391) {
              s5 = peg$c77;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseturn();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c79) {
                  s7 = peg$c79;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c80); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c81) {
                    s9 = peg$c81;
                    peg$currPos += 2;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c82); }
                  }
                  if (s9 !== peg$FAILED) {
                    peg$reportedPos = s8;
                    s9 = peg$c83();
                  }
                  s8 = s9;
                  if (s8 === peg$FAILED) {
                    s8 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c84) {
                      s9 = peg$c84;
                      peg$currPos += 2;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c85); }
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c81) {
                        s11 = peg$c81;
                        peg$currPos += 2;
                      } else {
                        s11 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c82); }
                      }
                      if (s11 !== peg$FAILED) {
                        peg$reportedPos = s10;
                        s11 = peg$c86();
                      }
                      s10 = s11;
                      if (s10 === peg$FAILED) {
                        s10 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c87) {
                          s11 = peg$c87;
                          peg$currPos += 2;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c88); }
                        }
                        if (s11 !== peg$FAILED) {
                          peg$reportedPos = s10;
                          s11 = peg$c89();
                        }
                        s10 = s11;
                      }
                      if (s10 !== peg$FAILED) {
                        peg$reportedPos = s8;
                        s9 = peg$c90(s10);
                        s8 = s9;
                      } else {
                        peg$currPos = s8;
                        s8 = peg$c0;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$c0;
                    }
                  }
                  if (s8 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c91(s6, s8);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 8) === peg$c92) {
                s5 = peg$c92;
                peg$currPos += 8;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c93); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseturn();
                if (s6 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 4) === peg$c94) {
                    s7 = peg$c94;
                    peg$currPos += 4;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c95); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c96(s6);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
              if (s4 === peg$FAILED) {
                s4 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c97) {
                  s5 = peg$c97;
                  peg$currPos += 3;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c98); }
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s4;
                  s5 = peg$c99();
                }
                s4 = s5;
                if (s4 === peg$FAILED) {
                  s4 = peg$currPos;
                  if (input.substr(peg$currPos, 4) === peg$c100) {
                    s5 = peg$c100;
                    peg$currPos += 4;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c101); }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c102();
                  }
                  s4 = s5;
                  if (s4 === peg$FAILED) {
                    s4 = peg$currPos;
                    if (input.substr(peg$currPos, 4) === peg$c103) {
                      s5 = peg$c103;
                      peg$currPos += 4;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c104); }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s4;
                      s5 = peg$c105();
                    }
                    s4 = s5;
                    if (s4 === peg$FAILED) {
                      s4 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 12391) {
                        s5 = peg$c77;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c78); }
                      }
                      if (s5 === peg$FAILED) {
                        s5 = peg$c2;
                      }
                      if (s5 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 35440) {
                          s6 = peg$c106;
                          peg$currPos++;
                        } else {
                          s6 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c107); }
                        }
                        if (s6 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 12415) {
                            s7 = peg$c108;
                            peg$currPos++;
                          } else {
                            s7 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c109); }
                          }
                          if (s7 === peg$FAILED) {
                            s7 = peg$c2;
                          }
                          if (s7 !== peg$FAILED) {
                            peg$reportedPos = s4;
                            s5 = peg$c110();
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$c0;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$c0;
                        }
                      } else {
                        peg$currPos = s4;
                        s4 = peg$c0;
                      }
                      if (s4 === peg$FAILED) {
                        s4 = peg$currPos;
                        if (input.substr(peg$currPos, 3) === peg$c111) {
                          s5 = peg$c111;
                          peg$currPos += 3;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c112); }
                        }
                        if (s5 !== peg$FAILED) {
                          peg$reportedPos = s4;
                          s5 = peg$c113();
                        }
                        s4 = s5;
                      }
                    }
                  }
                }
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c90(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefork() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c114) {
        s1 = peg$c114;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c115); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c14;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c14;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c73.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c74); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c73.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c74); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 25163) {
              s4 = peg$c75;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c76); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemoves();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c116(s3, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseturn() {
      var s0;

      if (peg$c9.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c10); }
      }

      return s0;
    }

    function peg$parsenl() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsenewline();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsenewline();
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseskipline();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseskipline();
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseskipline() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c117;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c118); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenewline();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 32) {
        s0 = peg$c14;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 9) {
          s0 = peg$c119;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c120); }
        }
      }

      return s0;
    }

    function peg$parsenewline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsewhitespace();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsewhitespace();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c121;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c122); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 13) {
            s3 = peg$c123;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c124); }
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 10) {
              s4 = peg$c121;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c122); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c2;
            }
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenonl() {
      var s0;

      if (peg$c125.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c126); }
      }

      return s0;
    }


    	function toN(ss){
    		return parseInt(ss.join(""), 10);
    	}
    	function zenToN(s){
    		return "０１２３４５６７８９".indexOf(s);
    	}
    	function kanToN(s){
    		return "〇一二三四五六七八九".indexOf(s);
    	}
    	function kanToN2(s){
    		switch(s.length){
    			case 1:
    				return "〇一二三四五六七八九十".indexOf(s);
    			case 2:
    				return "〇一二三四五六七八九十".indexOf(s[1])+10;
    			default:
    				throw "21以上の数値に対応していません";
    		}
    	}
    	function kindToCSA(kind){
    		if(kind[0]=="成"){
    			return {
    				"香": "NY",
    				"桂": "NK",
    				"銀": "NG"
    			}[kind[1]];
    		}
    		return {
    			"歩": "FU",
    			"香": "KY",
    			"桂": "KE",
    			"銀": "GI",
    			"金": "KI",
    			"角": "KA",
    			"飛": "HI",
    			"玉": "OU",
    			"王": "OU",
    			"と": "TO",
    			"杏": "NY",
    			"圭": "NK",
    			"全": "NG",
    			"馬": "UM",
    			"竜": "RY",
    			"龍": "RY"
    		}[kind];
    	}
    	function soutaiToRelative(str){
    		return {
    			"左": "L",
    			"直": "C",
    			"右": "R",
    		}[str] || "";
    	}
    	function dousaToRelative(str){
    		return {
    			"上": "U",
    			"寄": "C",
    			"引": "D",
    		}[str] || "";
    	}
    	function presetToString(preset){
    		return {
    			"平手": "HIRATE",
    			"香落ち": "KY",
    			"右香落ち": "KY_R",
    			"角落ち": "KA",
    			"飛車落ち": "HI",
    			"飛香落ち": "HIKY",
    			"二枚落ち": "2",
    			"三枚落ち": "3",
    			"四枚落ち": "4",
    			"五枚落ち": "5",
    			"左五枚落ち": "5_L",
    			"六枚落ち": "6",
    			"八枚落ち": "8",
    			"十枚落ち": "10",
    			"その他": "OTHER",
    		}[preset.replace(/\s/g, "")];
    	}
    	function makeHand(str){
    		var kinds = str.replace(/　$/, "").split("　");
    		var ret = {};
    		for(var i=0; i<kinds.length; i++){
    			ret[kindToCSA(kinds[i][0])] = kinds[i].length==1?1:kanToN2(kinds[i].slice(1));
    		}
    		return ret;
    	}


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
},{}],6:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { kifu: peg$parsekifu },
        peg$startRuleFunction  = peg$parsekifu,

        peg$c0 = peg$FAILED,
        peg$c1 = [],
        peg$c2 = null,
        peg$c3 = function(headers, ini, headers2, moves, forks) {
         	var ret = {header:{}, moves:moves}
        	for(var i=0; i<headers.length; i++){
        		ret.header[headers[i].k]=headers[i].v;
        	}
        	for(var i=0; i<headers2.length; i++){
        		ret.header[headers2[i].k]=headers2[i].v;
        	}
        	if(ini){
        		ret.initial = ini;
        	}else if(ret.header["手合割"]){
        		var preset = presetToString(ret.header["手合割"]);
        		if(preset!="OTHER") ret.initial={preset: preset};
        	}
        	if(ret.initial && ret.initial.data){
        		if(ret.header["手番"]){
        			ret.initial.data.color="下先".indexOf(ret.header["手番"])>=0 ? true : false;
        		}else{
        			ret.initial.data.color = true;
        		}
        		ret.initial.data.hands = [{}, {}];
        		if(ret.header["先手の持駒"] || ret.header["下手の持駒"]){
        			ret.initial.data.hands[0] = makeHand(ret.header["先手の持駒"] || ret.header["下手の持駒"]);
        			delete ret.header["先手の持駒"];
        			delete ret.header["下手の持駒"];
        		}
        		if(ret.header["後手の持駒"] || ret.header["上手の持駒"]){
        			ret.initial.data.hands[1] = makeHand(ret.header["後手の持駒"] || ret.header["上手の持駒"]);
        			delete ret.header["先手の持駒"];
        			delete ret.header["下手の持駒"];
        		}
        	}
        	var forkStack = [{te:0, moves:moves}];
        	for(var i=0; i<forks.length; i++){
        		var nowFork = forks[i];
        		var fork = forkStack.pop();
        		while(fork.te>nowFork.te){fork = forkStack.pop();}
        		var move = fork.moves[nowFork.te-fork.te];
        		move.forks = move.forks || [];
        		move.forks.push(nowFork.moves);
        		forkStack.push(fork);
        		forkStack.push(nowFork);
        	}
        	return ret;
        },
        peg$c4 = /^[^\uFF1A\r\n]/,
        peg$c5 = { type: "class", value: "[^\\uFF1A\\r\\n]", description: "[^\\uFF1A\\r\\n]" },
        peg$c6 = "\uFF1A",
        peg$c7 = { type: "literal", value: "\uFF1A", description: "\"\\uFF1A\"" },
        peg$c8 = function(key, value) {return {k:key.join(""), v:value.join("")}},
        peg$c9 = "\u624B\u756A",
        peg$c10 = { type: "literal", value: "\u624B\u756A", description: "\"\\u624B\\u756A\"" },
        peg$c11 = function(te) {return {k:"手番",v:te}},
        peg$c12 = /^[\u5148\u5F8C\u4E0A\u4E0B]/,
        peg$c13 = { type: "class", value: "[\\u5148\\u5F8C\\u4E0A\\u4E0B]", description: "[\\u5148\\u5F8C\\u4E0A\\u4E0B]" },
        peg$c14 = " ",
        peg$c15 = { type: "literal", value: " ", description: "\" \"" },
        peg$c16 = "+",
        peg$c17 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c18 = function(lines) {
        	var ret = [];
        	for(var i=0; i<9; i++){
        		var line = [];
        		for(var j=0; j<9; j++){
        			line.push(lines[j][8-i]);
        		}
        		ret.push(line);
        	}
        	return {preset: "OTHER", data: {board:ret}};
        },
        peg$c19 = "|",
        peg$c20 = { type: "literal", value: "|", description: "\"|\"" },
        peg$c21 = function(masu) { return masu; },
        peg$c22 = function(c, k) {return {color:c, kind:k}},
        peg$c23 = " \u30FB",
        peg$c24 = { type: "literal", value: " \u30FB", description: "\" \\u30FB\"" },
        peg$c25 = function() { return {} },
        peg$c26 = "^",
        peg$c27 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c28 = function() {return true},
        peg$c29 = "v",
        peg$c30 = { type: "literal", value: "v", description: "\"v\"" },
        peg$c31 = "V",
        peg$c32 = { type: "literal", value: "V", description: "\"V\"" },
        peg$c33 = function() {return false},
        peg$c34 = "\u624B\u6570----\u6307\u624B--",
        peg$c35 = { type: "literal", value: "\u624B\u6570----\u6307\u624B--", description: "\"\\u624B\\u6570----\\u6307\\u624B--\"" },
        peg$c36 = "-------\u6D88\u8CBB\u6642\u9593--",
        peg$c37 = { type: "literal", value: "-------\u6D88\u8CBB\u6642\u9593--", description: "\"-------\\u6D88\\u8CBB\\u6642\\u9593--\"" },
        peg$c38 = function(hd, tl) {tl.unshift(hd); return tl;},
        peg$c39 = function(c) {return c.length==0 ? {} : {comments:c}},
        peg$c40 = function(line, c) {
        	var ret = {time: line.time};
        	if(c.length>0) ret.comments = c;
        	if(typeof line.move=="object"){
        		ret.move=line.move;
        	}else{
        		ret.special=specialToCSA(line.move)
        	}
        	return ret;
        },
        peg$c41 = "&",
        peg$c42 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c43 = function(fugou, from) {
        	var ret = {from: from, piece: fugou.piece};
        	if(fugou.to){ret.to=fugou.to}else{ret.same=true};
        	if(fugou.promote) ret.promote=true;
        	return ret;
        },
        peg$c44 = /^[^\r\n ]/,
        peg$c45 = { type: "class", value: "[^\\r\\n ]", description: "[^\\r\\n ]" },
        peg$c46 = function(spe) {return spe.join("")},
        peg$c47 = function(move, time) {return {move: move, time: time}},
        peg$c48 = /^[0-9]/,
        peg$c49 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c50 = "\u6210",
        peg$c51 = { type: "literal", value: "\u6210", description: "\"\\u6210\"" },
        peg$c52 = function(pl, pi, pro) {return {to:pl, piece: pi,promote:!!pro};},
        peg$c53 = function(x, y) {return {x:x,y:y}},
        peg$c54 = "\u540C\u3000",
        peg$c55 = { type: "literal", value: "\u540C\u3000", description: "\"\\u540C\\u3000\"" },
        peg$c56 = function() {return null},
        peg$c57 = /^[\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]/,
        peg$c58 = { type: "class", value: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]", description: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]" },
        peg$c59 = function(n) {return zenToN(n);},
        peg$c60 = /^[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]/,
        peg$c61 = { type: "class", value: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]", description: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]" },
        peg$c62 = function(n) {return kanToN(n);},
        peg$c63 = /^[\u6B69\u9999\u6842\u9280\u91D1\u89D2\u98DB\u738B\u7389\u3068\u674F\u572D\u5168\u99AC\u7ADC\u9F8D]/,
        peg$c64 = { type: "class", value: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]", description: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]" },
        peg$c65 = function(pro, p) {return kindToCSA((pro||"")+p);},
        peg$c66 = "\u6253",
        peg$c67 = { type: "literal", value: "\u6253", description: "\"\\u6253\"" },
        peg$c68 = "(",
        peg$c69 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c70 = /^[1-9]/,
        peg$c71 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c72 = ")",
        peg$c73 = { type: "literal", value: ")", description: "\")\"" },
        peg$c74 = function(x, y) {return {x:parseInt(x),y:parseInt(y)}},
        peg$c75 = "/",
        peg$c76 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c77 = function(now, total) {return {now: now, total: total}},
        peg$c78 = ":",
        peg$c79 = { type: "literal", value: ":", description: "\":\"" },
        peg$c80 = function(h, m, s) {return {h:toN(h),m:toN(m),s:toN(s)}},
        peg$c81 = function(m, s) {return {m:toN(m),s:toN(s)}},
        peg$c82 = "*",
        peg$c83 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c84 = function(comm) {return comm.join("")},
        peg$c85 = "\u307E\u3067",
        peg$c86 = { type: "literal", value: "\u307E\u3067", description: "\"\\u307E\\u3067\"" },
        peg$c87 = "\u624B",
        peg$c88 = { type: "literal", value: "\u624B", description: "\"\\u624B\"" },
        peg$c89 = "\u3067",
        peg$c90 = { type: "literal", value: "\u3067", description: "\"\\u3067\"" },
        peg$c91 = "\u624B\u306E",
        peg$c92 = { type: "literal", value: "\u624B\u306E", description: "\"\\u624B\\u306E\"" },
        peg$c93 = "\u52DD\u3061",
        peg$c94 = { type: "literal", value: "\u52DD\u3061", description: "\"\\u52DD\\u3061\"" },
        peg$c95 = function() {return "TORYO"},
        peg$c96 = "\u53CD\u5247",
        peg$c97 = { type: "literal", value: "\u53CD\u5247", description: "\"\\u53CD\\u5247\"" },
        peg$c98 = function() {return "ILLEGAL_ACTION"},
        peg$c99 = "\u8CA0\u3051",
        peg$c100 = { type: "literal", value: "\u8CA0\u3051", description: "\"\\u8CA0\\u3051\"" },
        peg$c101 = function() {return "ILLEGAL_MOVE"},
        peg$c102 = function(res) {return res},
        peg$c103 = function(win, res) {return res},
        peg$c104 = "\u3067\u6642\u9593\u5207\u308C\u306B\u3088\u308A",
        peg$c105 = { type: "literal", value: "\u3067\u6642\u9593\u5207\u308C\u306B\u3088\u308A", description: "\"\\u3067\\u6642\\u9593\\u5207\\u308C\\u306B\\u3088\\u308A\"" },
        peg$c106 = "\u624B\u306E\u52DD\u3061",
        peg$c107 = { type: "literal", value: "\u624B\u306E\u52DD\u3061", description: "\"\\u624B\\u306E\\u52DD\\u3061\"" },
        peg$c108 = function(win) {return "TIME_UP"},
        peg$c109 = "\u3067\u4E2D\u65AD",
        peg$c110 = { type: "literal", value: "\u3067\u4E2D\u65AD", description: "\"\\u3067\\u4E2D\\u65AD\"" },
        peg$c111 = function() {return "CHUDAN"},
        peg$c112 = "\u3067\u6301\u5C06\u68CB",
        peg$c113 = { type: "literal", value: "\u3067\u6301\u5C06\u68CB", description: "\"\\u3067\\u6301\\u5C06\\u68CB\"" },
        peg$c114 = function() {return "JISHOGI"},
        peg$c115 = "\u3067\u5343\u65E5\u624B",
        peg$c116 = { type: "literal", value: "\u3067\u5343\u65E5\u624B", description: "\"\\u3067\\u5343\\u65E5\\u624B\"" },
        peg$c117 = function() {return "SENNICHITE"},
        peg$c118 = "\u8A70",
        peg$c119 = { type: "literal", value: "\u8A70", description: "\"\\u8A70\"" },
        peg$c120 = "\u307F",
        peg$c121 = { type: "literal", value: "\u307F", description: "\"\\u307F\"" },
        peg$c122 = function() {return "TSUMI"},
        peg$c123 = "\u3067\u4E0D\u8A70",
        peg$c124 = { type: "literal", value: "\u3067\u4E0D\u8A70", description: "\"\\u3067\\u4E0D\\u8A70\"" },
        peg$c125 = function() {return "FUZUMI"},
        peg$c126 = "\u5909\u5316\uFF1A",
        peg$c127 = { type: "literal", value: "\u5909\u5316\uFF1A", description: "\"\\u5909\\u5316\\uFF1A\"" },
        peg$c128 = function(te, moves) {return {te:parseInt(te), moves:moves.slice(1)}},
        peg$c129 = "#",
        peg$c130 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c131 = "\t",
        peg$c132 = { type: "literal", value: "\t", description: "\"\\t\"" },
        peg$c133 = "\n",
        peg$c134 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c135 = "\r",
        peg$c136 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c137 = /^[^\r\n]/,
        peg$c138 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsekifu() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseskipline();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseskipline();
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseheader();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseheader();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseinitialboard();
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseheader();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseheader();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesplit();
              if (s5 === peg$FAILED) {
                s5 = peg$c2;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemoves();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parsefork();
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parsefork();
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsenl();
                    if (s8 === peg$FAILED) {
                      s8 = peg$c2;
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c3(s2, s3, s4, s6, s7);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseheader() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c4.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c5); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c4.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c5); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 65306) {
          s2 = peg$c6;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c7); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsenonl();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsenonl();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsenl();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c8(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseturn();
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c9) {
            s2 = peg$c9;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c10); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenl();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c11(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parseturn() {
      var s0;

      if (peg$c12.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }

      return s0;
    }

    function peg$parseinitialboard() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c14;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsenonl();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsenonl();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsenl();
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 43) {
          s3 = peg$c16;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsenonl();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsenonl();
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenl();
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseikkatsuline();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseikkatsuline();
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 43) {
              s5 = peg$c16;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c17); }
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$parsenonl();
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$parsenonl();
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsenl();
                if (s7 !== peg$FAILED) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c2;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c18(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseikkatsuline() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 124) {
        s1 = peg$c19;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemasu();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsemasu();
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 124) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsenonl();
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsenonl();
              }
            } else {
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c21(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemasu() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseteban();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c22(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c23) {
          s1 = peg$c23;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c25();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseteban() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c14;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s1 = peg$c16;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 94) {
            s1 = peg$c26;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c27); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c28();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 118) {
          s1 = peg$c29;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c30); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 86) {
            s1 = peg$c31;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c33();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsesplit() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10) === peg$c34) {
        s1 = peg$c34;
        peg$currPos += 10;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 13) === peg$c36) {
          s2 = peg$c36;
          peg$currPos += 13;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemoves() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsefirstboard();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemove();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsemove();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseresult();
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c38(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefirstboard() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepointer();
        if (s2 === peg$FAILED) {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemove() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseline();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsecomment();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsecomment();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsepointer();
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c40(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepointer() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 38) {
        s1 = peg$c41;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseline() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c14;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c14;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsete();
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (input.charCodeAt(peg$currPos) === 32) {
            s4 = peg$c14;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (input.charCodeAt(peg$currPos) === 32) {
              s4 = peg$c14;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c15); }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsefugou();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsefrom();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s4;
                s5 = peg$c43(s5, s6);
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              s5 = [];
              if (peg$c44.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c45); }
              }
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (peg$c44.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
                }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s4;
                s5 = peg$c46(s5);
              }
              s4 = s5;
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              if (input.charCodeAt(peg$currPos) === 32) {
                s6 = peg$c14;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c15); }
              }
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (input.charCodeAt(peg$currPos) === 32) {
                  s6 = peg$c14;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c15); }
                }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsetime();
                if (s6 === peg$FAILED) {
                  s6 = peg$c2;
                }
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 43) {
                    s7 = peg$c16;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c17); }
                  }
                  if (s7 === peg$FAILED) {
                    s7 = peg$c2;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsenl();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c47(s4, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsete() {
      var s0, s1;

      s0 = [];
      if (peg$c48.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefugou() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseplace();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 25104) {
            s3 = peg$c50;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c51); }
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c52(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseplace() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsenum();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenumkan();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c53(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c54) {
          s1 = peg$c54;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c55); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c56();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsenum() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c57.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c59(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenumkan() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c60.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c62(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsepiece() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 25104) {
        s1 = peg$c50;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        if (peg$c63.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c64); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c65(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefrom() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 25171) {
        s1 = peg$c66;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c56();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
          s1 = peg$c68;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c69); }
        }
        if (s1 !== peg$FAILED) {
          if (peg$c70.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c71); }
          }
          if (s2 !== peg$FAILED) {
            if (peg$c70.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c71); }
            }
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s4 = peg$c72;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c73); }
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c74(s2, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsetime() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c68;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c14;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c14;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsems();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s4 = peg$c75;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c76); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsehms();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 41) {
                  s6 = peg$c72;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c73); }
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c77(s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsehms() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c48.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c78;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c79); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c48.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c78;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c79); }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              if (peg$c48.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  if (peg$c48.test(input.charAt(peg$currPos))) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c49); }
                  }
                }
              } else {
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c80(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsems() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c48.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c78;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c79); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c48.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c81(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c82;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c83); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c84(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseresult() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c85) {
        s1 = peg$c85;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c86); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c48.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c48.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c49); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 25163) {
            s3 = peg$c87;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c88); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 12391) {
              s5 = peg$c89;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c90); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseturn();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c91) {
                  s7 = peg$c91;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c92); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c93) {
                    s9 = peg$c93;
                    peg$currPos += 2;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c94); }
                  }
                  if (s9 !== peg$FAILED) {
                    peg$reportedPos = s8;
                    s9 = peg$c95();
                  }
                  s8 = s9;
                  if (s8 === peg$FAILED) {
                    s8 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c96) {
                      s9 = peg$c96;
                      peg$currPos += 2;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c97); }
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c93) {
                        s11 = peg$c93;
                        peg$currPos += 2;
                      } else {
                        s11 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c94); }
                      }
                      if (s11 !== peg$FAILED) {
                        peg$reportedPos = s10;
                        s11 = peg$c98();
                      }
                      s10 = s11;
                      if (s10 === peg$FAILED) {
                        s10 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c99) {
                          s11 = peg$c99;
                          peg$currPos += 2;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c100); }
                        }
                        if (s11 !== peg$FAILED) {
                          peg$reportedPos = s10;
                          s11 = peg$c101();
                        }
                        s10 = s11;
                      }
                      if (s10 !== peg$FAILED) {
                        peg$reportedPos = s8;
                        s9 = peg$c102(s10);
                        s8 = s9;
                      } else {
                        peg$currPos = s8;
                        s8 = peg$c0;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$c0;
                    }
                  }
                  if (s8 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c103(s6, s8);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 8) === peg$c104) {
                s5 = peg$c104;
                peg$currPos += 8;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c105); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseturn();
                if (s6 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 4) === peg$c106) {
                    s7 = peg$c106;
                    peg$currPos += 4;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c107); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c108(s6);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
              if (s4 === peg$FAILED) {
                s4 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c109) {
                  s5 = peg$c109;
                  peg$currPos += 3;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c110); }
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s4;
                  s5 = peg$c111();
                }
                s4 = s5;
                if (s4 === peg$FAILED) {
                  s4 = peg$currPos;
                  if (input.substr(peg$currPos, 4) === peg$c112) {
                    s5 = peg$c112;
                    peg$currPos += 4;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c113); }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c114();
                  }
                  s4 = s5;
                  if (s4 === peg$FAILED) {
                    s4 = peg$currPos;
                    if (input.substr(peg$currPos, 4) === peg$c115) {
                      s5 = peg$c115;
                      peg$currPos += 4;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c116); }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s4;
                      s5 = peg$c117();
                    }
                    s4 = s5;
                    if (s4 === peg$FAILED) {
                      s4 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 12391) {
                        s5 = peg$c89;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c90); }
                      }
                      if (s5 === peg$FAILED) {
                        s5 = peg$c2;
                      }
                      if (s5 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 35440) {
                          s6 = peg$c118;
                          peg$currPos++;
                        } else {
                          s6 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c119); }
                        }
                        if (s6 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 12415) {
                            s7 = peg$c120;
                            peg$currPos++;
                          } else {
                            s7 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c121); }
                          }
                          if (s7 === peg$FAILED) {
                            s7 = peg$c2;
                          }
                          if (s7 !== peg$FAILED) {
                            peg$reportedPos = s4;
                            s5 = peg$c122();
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$c0;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$c0;
                        }
                      } else {
                        peg$currPos = s4;
                        s4 = peg$c0;
                      }
                      if (s4 === peg$FAILED) {
                        s4 = peg$currPos;
                        if (input.substr(peg$currPos, 3) === peg$c123) {
                          s5 = peg$c123;
                          peg$currPos += 3;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c124); }
                        }
                        if (s5 !== peg$FAILED) {
                          peg$reportedPos = s4;
                          s5 = peg$c125();
                        }
                        s4 = s5;
                      }
                    }
                  }
                }
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c102(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefork() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c126) {
        s1 = peg$c126;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c127); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c14;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c14;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c48.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 25163) {
              s4 = peg$c87;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c88); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemoves();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c128(s3, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenl() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsenewline();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsenewline();
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseskipline();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseskipline();
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseskipline() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c129;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c130); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsenonl();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsenonl();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenewline();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 32) {
        s0 = peg$c14;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 9) {
          s0 = peg$c131;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c132); }
        }
      }

      return s0;
    }

    function peg$parsenewline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsewhitespace();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsewhitespace();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c133;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c134); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 13) {
            s3 = peg$c135;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c136); }
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 10) {
              s4 = peg$c133;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c134); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c2;
            }
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenonl() {
      var s0;

      if (peg$c137.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c138); }
      }

      return s0;
    }


    	function toN(ss){
    		return parseInt(ss.join(""), 10);
    	}
    	function zenToN(s){
    		return "０１２３４５６７８９".indexOf(s);
    	}
    	function kanToN(s){
    		return "〇一二三四五六七八九".indexOf(s);
    	}
    	function kanToN2(s){
    		switch(s.length){
    			case 1:
    				return "〇一二三四五六七八九十".indexOf(s);
    			case 2:
    				return "〇一二三四五六七八九十".indexOf(s[1])+10;
    			default:
    				throw "21以上の数値に対応していません";
    		}
    	}
    	function kindToCSA(kind){
    		if(kind[0]=="成"){
    			return {
    				"香": "NY",
    				"桂": "NK",
    				"銀": "NG"
    			}[kind[1]];
    		}
    		return {
    			"歩": "FU",
    			"香": "KY",
    			"桂": "KE",
    			"銀": "GI",
    			"金": "KI",
    			"角": "KA",
    			"飛": "HI",
    			"玉": "OU",
    			"王": "OU",
    			"と": "TO",
    			"杏": "NY",
    			"圭": "NK",
    			"全": "NG",
    			"馬": "UM",
    			"竜": "RY",
    			"龍": "RY"
    		}[kind];
    	}
    	function specialToCSA(str){
    		return {
    			"中断": "CHUDAN",
    			"投了": "TORYO",
    			"持将棋": "JISHOGI",
    			"千日手": "SENNICHITE",
    			"詰み": "TSUMI",
    			"不詰": "FUZUMI",
    			"切れ負け": "TIME_UP",
    			"反則勝ち": "ILLEGAL_ACTION", // 直前の手が反則(先頭に+か-で反則した側の情報を含める必要が有る)
    			"反則負け": "ILLEGAL_MOVE" // ここで手番側が反則，反則の内容はコメントで表現
    		}[str];
    	}
    	function presetToString(preset){
    		return {
    			"平手": "HIRATE",
    			"香落ち": "KY",
    			"右香落ち": "KY_R",
    			"角落ち": "KA",
    			"飛車落ち": "HI",
    			"飛香落ち": "HIKY",
    			"二枚落ち": "2",
    			"三枚落ち": "3",
    			"四枚落ち": "4",
    			"五枚落ち": "5",
    			"左五枚落ち": "5_L",
    			"六枚落ち": "6",
    			"八枚落ち": "8",
    			"十枚落ち": "10",
    			"その他": "OTHER",
    		}[preset.replace(/\s/g, "")];
    	}
    	function makeHand(str){
    		var kinds = str.replace(/　$/, "").split("　");
    		var ret = {};
    		for(var i=0; i<kinds.length; i++){
    			ret[kindToCSA(kinds[i][0])] = kinds[i].length==1?1:kanToN2(kinds[i].slice(1));
    		}
    		return ret;
    	}


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
},{}]},{},[2]);
