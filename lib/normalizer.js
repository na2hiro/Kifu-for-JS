"use strict";
exports.__esModule = true;
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var shogi_js_1 = require("shogi.js");
function canPromote(place, color) {
    return color === shogi_js_1.Color.Black ? place.y <= 3 : place.y >= 7;
}
exports.canPromote = canPromote;
// 最小形式の棋譜をnormalizeする
// 最小形式: (指し) from, to, promote; (打ち) piece, to
function normalizeMinimal(obj) {
    var shogi = new shogi_js_1.Shogi(obj.initial || undefined);
    normalizeMinimalMoves(shogi, obj.moves);
    return obj;
}
exports.normalizeMinimal = normalizeMinimal;
function normalizeMinimalMoves(shogi, moves, lastMove) {
    for (var i = 0; i < moves.length; i++) {
        var last = i === 0 ? lastMove : moves[i - 1];
        var move = moves[i].move;
        if (!move) {
            continue;
        }
        // 手番
        move.color = shogi.turn;
        if (move.from) {
            // move
            // toからsame復元
            if (last && last.move && move.to.x === last.move.to.x && move.to.y === last.move.to.y) {
                move.same = true;
            }
            // capture復元
            addCaptureInformation(shogi, move);
            // piece復元
            if (!move.piece) {
                move.piece = shogi.get(move.from.x, move.from.y).kind;
            }
            // 不成復元
            if (!move.promote && !shogi_js_1.Piece.isPromoted(move.piece) && shogi_js_1.Piece.canPromote(move.piece)) {
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
                throw new Error(i + "手目で失敗しました: " + e);
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
    restoreColorOfIllegalAction(moves, shogi);
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
        var last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (var _i = 0, _a = moves[i].forks; _i < _a.length; _i++) {
                var fork = _a[_i];
                normalizeMinimalMoves(shogi, fork, last);
            }
        }
    }
}
function normalizeKIF(obj) {
    // Kifu for iPhone bug
    if (obj.initial && obj.initial.preset === "HIRATE" && obj.initial.data) {
        obj.initial.preset = "OTHER";
    }
    var shogi = new shogi_js_1.Shogi(obj.initial || undefined);
    normalizeKIFMoves(shogi, obj.moves);
    return obj;
}
exports.normalizeKIF = normalizeKIF;
function normalizeKIFMoves(shogi, moves, lastMove) {
    for (var i = 0; i < moves.length; i++) {
        var last = i === 0 ? lastMove : moves[i - 1];
        var move = moves[i].move;
        if (!move) {
            continue;
        }
        // 手番
        move.color = shogi.turn;
        if (move.from) {
            // move
            // sameからto復元
            if (move.same) {
                move.to = last.move.to;
            }
            // capture復元
            addCaptureInformation(shogi, move);
            // 不成復元
            if (!move.promote && !shogi_js_1.Piece.isPromoted(move.piece) && shogi_js_1.Piece.canPromote(move.piece)) {
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
                throw new Error(i + "手目で失敗しました: " + e);
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
    restoreColorOfIllegalAction(moves, shogi);
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
        var last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (var _i = 0, _a = moves[i].forks; _i < _a.length; _i++) {
                var fork = _a[_i];
                normalizeKIFMoves(shogi, fork, last);
            }
        }
    }
}
function normalizeKI2(obj) {
    var shogi = new shogi_js_1.Shogi(obj.initial || undefined);
    normalizeKI2Moves(shogi, obj.moves);
    return obj;
}
exports.normalizeKI2 = normalizeKI2;
function normalizeKI2Moves(shogi, moves, lastMove) {
    for (var i = 0; i < moves.length; i++) {
        var last = i === 0 ? lastMove : moves[i - 1];
        var move = moves[i].move;
        if (!move) {
            continue;
        }
        // 手番
        move.color = shogi.turn;
        // 同からto復元
        if (move.same) {
            move.to = last.move.to;
        }
        // from復元
        var candMoves = shogi.getMovesTo(move.to.x, move.to.y, move.piece);
        if (move.relative === "H" || candMoves.length === 0) {
            // ok
        }
        else if (candMoves.length === 1) {
            move.from = candMoves[0].from;
        }
        else {
            // 相対逆算
            var moveAns = filterMovesByRelatives(move.relative, shogi.turn, candMoves);
            if (moveAns.length !== 1) {
                throw new Error("相対情報が不完全で複数の候補があります");
            }
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
                throw new Error(i + "手目で失敗しました: " + e);
            }
        }
        else {
            // drop
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    restoreColorOfIllegalAction(moves, shogi);
    for (var i = moves.length - 1; i >= 0; i--) {
        var move = moves[i].move;
        if (!move) {
            continue;
        }
        if (move.from) {
            shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
        }
        else {
            shogi.undrop(move.to.x, move.to.y);
        }
        var last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (var _i = 0, _a = moves[i].forks; _i < _a.length; _i++) {
                var fork = _a[_i];
                normalizeKI2Moves(shogi, fork, last);
            }
        }
    }
}
function normalizeCSA(obj) {
    restorePreset(obj);
    var shogi = new shogi_js_1.Shogi(obj.initial || undefined);
    for (var i = 0; i < obj.moves.length; i++) {
        restoreTotalTime(obj.moves[i].time, i >= 2 ? obj.moves[i - 2].time : void 0);
        var move = obj.moves[i].move;
        if (!move) {
            continue;
        }
        // 手番
        move.color = shogi.turn;
        if (move.from) {
            // move
            // same復元
            if (i > 0 && obj.moves[i - 1].move && obj.moves[i - 1].move.to.x === move.to.x
                && obj.moves[i - 1].move.to.y === move.to.y) {
                move.same = true;
            }
            // capture復元
            addCaptureInformation(shogi, move);
            if (shogi_js_1.Piece.isPromoted(move.piece)) {
                // 成かも
                var from = shogi.get(move.from.x, move.from.y);
                if (from.kind !== move.piece) {
                    move.piece = from.kind;
                    move.promote = true;
                }
            }
            else if (shogi_js_1.Piece.canPromote(move.piece)) {
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
                throw new Error(i + "手目で失敗しました: " + e);
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
    var moveVectors = shogi.getMovesTo(move.to.x, move.to.y, move.piece)
        .map(function (mv) { return flipVector(shogi.turn, spaceshipVector(mv.to, mv.from)); });
    if (moveVectors.length >= 2) {
        var realVector_1 = flipVector(shogi.turn, spaceshipVector(move.to, move.from));
        move.relative = (function () {
            // 上下方向唯一
            if (moveVectors.filter(function (mv) { return mv.y === realVector_1.y; }).length === 1) {
                return YToUMD(realVector_1.y);
            }
            // 左右方向唯一
            if (moveVectors.filter(function (mv) { return mv.x === realVector_1.x; }).length === 1) {
                if ((move.piece === "UM" || move.piece === "RY") && realVector_1.x === 0) {
                    // 直はだめ
                    return XToLCR(moveVectors.filter(function (mv) { return mv.x < 0; }).length === 0 ? -1 : 1);
                }
                else {
                    return XToLCR(realVector_1.x);
                }
            }
            // 上下も左右も他の駒がいる
            return XToLCR(realVector_1.x) + YToUMD(realVector_1.y);
        })();
    }
}
function addCaptureInformation(shogi, move) {
    var to = shogi.get(move.to.x, move.to.y);
    if (to) {
        move.capture = to.kind;
    }
}
function flipVector(color, vector) {
    return color === shogi_js_1.Color.Black ? vector : { x: -vector.x, y: -vector.y };
}
function spaceship(a, b) {
    return a === b ? 0 : (a > b ? 1 : -1);
}
function spaceshipVector(a, b) {
    return { x: spaceship(a.x, b.x), y: spaceship(a.y, b.y) };
}
// yの段から移動した場合の相対情報
function YToUMD(y) {
    return y === 0 ? "M" : (y > 0 ? "D" : "U");
}
// xの行から移動した場合の相対情報
function XToLCR(x) {
    return x === 0 ? "C" : (x > 0 ? "R" : "L");
}
function filterMovesByRelatives(relative, color, moves) {
    var ret = [];
    var _loop_1 = function (move) {
        if (relative.split("").every(function (rel) { return moveSatisfiesRelative(rel, color, move); })) {
            ret.push(move);
        }
    };
    for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
        var move = moves_1[_i];
        _loop_1(move);
    }
    return ret;
}
function moveSatisfiesRelative(relative, color, move) {
    var vec = flipVector(color, { x: move.to.x - move.from.x, y: move.to.y - move.from.y });
    switch (relative) {
        case "U":
            return vec.y < 0;
        case "M":
            return vec.y === 0;
        case "D":
            return vec.y > 0;
        case "L":
            return vec.x < 0;
        case "C":
            return vec.x === 0;
        case "R":
            return vec.x > 0;
    }
}
// CSA等で盤面みたままで表現されているものをpresetに戻せれば戻す
function restorePreset(obj) {
    if (!obj.initial || obj.initial.preset !== "OTHER") {
        return;
    }
    var kinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI"];
    for (var i = 0; i < 2; i++) {
        for (var _i = 0, kinds_1 = kinds; _i < kinds_1.length; _i++) {
            var kind = kinds_1[_i];
            if (obj.initial.data.hands[i][kind] !== 0) {
                return;
            }
        }
    }
    /* tslint:disable:max-line-length */
    var hirate = [
        [{ color: shogi_js_1.Color.White, kind: "KY" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "KY" }],
        [{ color: shogi_js_1.Color.White, kind: "KE" }, { color: shogi_js_1.Color.White, kind: "KA" }, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, { color: shogi_js_1.Color.Black, kind: "HI" }, { color: shogi_js_1.Color.Black, kind: "KE" }],
        [{ color: shogi_js_1.Color.White, kind: "GI" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "GI" }],
        [{ color: shogi_js_1.Color.White, kind: "KI" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "KI" }],
        [{ color: shogi_js_1.Color.White, kind: "OU" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "OU" }],
        [{ color: shogi_js_1.Color.White, kind: "KI" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "KI" }],
        [{ color: shogi_js_1.Color.White, kind: "GI" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "GI" }],
        [{ color: shogi_js_1.Color.White, kind: "KE" }, { color: shogi_js_1.Color.White, kind: "HI" }, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, { color: shogi_js_1.Color.Black, kind: "KA" }, { color: shogi_js_1.Color.Black, kind: "KE" }],
        [{ color: shogi_js_1.Color.White, kind: "KY" }, {}, { color: shogi_js_1.Color.White, kind: "FU" }, {}, {}, {}, { color: shogi_js_1.Color.Black, kind: "FU" }, {}, { color: shogi_js_1.Color.Black, kind: "KY" }],
    ];
    /* tslint:enable:max-line-length */
    var diff = [];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (!samePiece(obj.initial.data.board[i][j], hirate[i][j])) {
                diff.push("" + (i + 1) + (j + 1));
            }
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
    if (preset === "HIRATE") {
        if (obj.initial.data.color === shogi_js_1.Color.Black) {
            obj.initial.preset = "HIRATE";
            delete obj.initial.data;
        }
    }
    else if (preset && obj.initial.data.color === shogi_js_1.Color.White) {
        obj.initial.preset = preset;
        delete obj.initial.data;
    }
}
function samePiece(p1, p2) {
    return (typeof p1.color === "undefined" && typeof p2.color === "undefined") ||
        (typeof p1.color !== "undefined" && typeof p2.color !== "undefined" && p1.color === p2.color
            && p1.kind === p2.kind);
}
function restoreColorOfIllegalAction(moves, shogi) {
    if (moves.length >= 1 && moves[moves.length - 1].special === "ILLEGAL_ACTION") {
        moves[moves.length - 1].special = (shogi.turn ? "+" : "-") + "ILLEGAL_ACTION";
    }
}
function restoreTotalTime(time, lastTime) {
    if (lastTime === void 0) { lastTime = { now: { m: 0, s: 0 }, total: { h: 0, m: 0, s: 0 } }; }
    if (!time) {
        return;
    }
    time.total = {
        h: (time.now.h || 0) + lastTime.total.h,
        m: time.now.m + lastTime.total.m,
        s: time.now.s + lastTime.total.s
    };
    time.total.m += Math.floor(time.total.s / 60);
    time.total.s = time.total.s % 60;
    time.total.h += Math.floor(time.total.m / 60);
    time.total.m = time.total.m % 60;
}
