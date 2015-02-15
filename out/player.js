/** @license
 * Shogi.js
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var Shogi = (function () {
    function Shogi(setting) {
        if (setting === void 0) { setting = {}; }
        this.initialize(setting);
    }
    // 盤面を平手に初期化する
    Shogi.prototype.initialize = function (setting) {
        if (!setting.preset)
            setting.preset = "HIRATE";
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
            this.turn = setting.data.color ? 0 /* Black */ : 1 /* White */;
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
        this.editMode(true);
        this.move(tox, toy, fromx, fromy);
        if (promote)
            piece.unpromote();
        if (capture) {
            if (Piece.isPromoted(capture))
                captured.promote();
            this.set(tox, toy, captured);
        }
        this.editMode(false);
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
        this.checkTurn(Piece.oppositeColor(piece.color));
        if (piece == null)
            throw "there is no piece at " + tox + ", " + toy;
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
        ret.push(this.turn == 0 /* Black */ ? "+" : "-");
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
        var piece = this.get(x, y);
        if (piece == null)
            return [];
        var moveDef = Piece.getMoveDef(piece.kind);
        var ret = [], from = { x: x, y: y };
        if (moveDef.just) {
            for (var i = 0; i < moveDef.just.length; i++) {
                var def = moveDef.just[i];
                if (piece.color == 1 /* White */) {
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
                if (piece.color == 1 /* White */) {
                    def[0] *= -1;
                    def[1] *= -1;
                }
                var to = { x: from.x + def[0], y: from.y + def[1] };
                while (legal(to.x, to.y, piece.color)) {
                    ret.push({ from: from, to: { x: to.x, y: to.y } });
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
        this.turn = this.turn == 0 /* Black */ ? 1 /* White */ : 0 /* Black */;
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
            turn: 0 /* Black */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
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
            turn: 1 /* White */
        }
    };
    return Shogi;
})();
var Color;
(function (Color) {
    Color[Color["Black"] = 0] = "Black";
    Color[Color["White"] = 1] = "White";
})(Color || (Color = {}));
// enum Kind {HI, KY, KE, GI, KI, KA, HI, OU, TO, NY, NK, NG, UM, RY}
var Piece = (function () {
    function Piece(csa) {
        this.color = csa.slice(0, 1) == "+" ? 0 /* Black */ : 1 /* White */;
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
        this.color = this.color == 0 /* Black */ ? 1 /* White */ : 0 /* Black */;
    };
    // CSAによる駒表現の文字列を返す
    Piece.prototype.toCSAString = function () {
        return (this.color == 0 /* Black */ ? "+" : "-") + this.kind;
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
        return color == 0 /* Black */ ? 1 /* White */ : 0 /* Black */;
    };
    // 以下private method
    // 現在成っているかどうかを返す
    Piece.prototype.isPromoted = function () {
        return Piece.isPromoted(this.kind);
    };
    return Piece;
})();
/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var Normalizer;
(function (Normalizer) {
    function canPromote(place, color) {
        return color == 0 /* Black */ ? place.y <= 3 : place.y >= 7;
    }
    Normalizer.canPromote = canPromote;
    function normalizeKIF(obj) {
        var shogi = new Shogi(obj.initial || undefined);
        normalizeKIFMoves(shogi, obj.moves);
        return obj;
    }
    Normalizer.normalizeKIF = normalizeKIF;
    function normalizeKIFMoves(shogi, moves, lastMove) {
        for (var i = 0; i < moves.length; i++) {
            var last = i <= 1 ? lastMove : moves[i - 1];
            var move = moves[i].move;
            if (!move)
                continue;
            // 手番
            move.color = shogi.turn == 0 /* Black */;
            if (move.from) {
                // move
                // sameからto復元
                if (move.same)
                    move.to = last.move.to;
                // capture復元
                addCaptureInformation(shogi, move);
                // piece復元(KIF以外の最低限形式で使用)
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
    Normalizer.normalizeKI2 = normalizeKI2;
    function normalizeKI2Moves(shogi, moves, lastMove) {
        for (var i = 0; i < moves.length; i++) {
            var last = i <= 1 ? lastMove : moves[i - 1];
            var move = moves[i].move;
            if (!move)
                continue;
            // 手番
            move.color = shogi.turn == 0 /* Black */;
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
            move.color = shogi.turn == 0 /* Black */;
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
    Normalizer.normalizeCSA = normalizeCSA;
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
        return color == 0 /* Black */ ? vector : { x: -vector.x, y: -vector.y };
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
        return (typeof p1.color == "undefined" && typeof p2.color == "undefined") || (typeof p1.color != "undefined" && typeof p2.color != "undefined" && p1.color == p2.color && p1.kind == p2.kind);
    }
    function restoreColorOfIllegalAction(moves) {
        if (moves[moves.length - 1].special == "ILLEGAL_ACTION") {
            moves[moves.length - 1].special = (moves[moves.length - 2] && moves[moves.length - 2].move && moves[moves.length - 2].move.color == false ? "-" : "+") + "ILLEGAL_ACTION";
        }
    }
})(Normalizer || (Normalizer = {}));
/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />
/// <reference path="./normalizer.ts" />
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
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
        if (!JKFPlayer.kifParser)
            throw "パーサが読み込まれていません";
        JKFPlayer.log("parseKIF", kifu);
        return new JKFPlayer(Normalizer.normalizeKIF(JKFPlayer.kifParser.parse(kifu)));
    };
    JKFPlayer.parseKI2 = function (kifu) {
        if (!JKFPlayer.ki2Parser)
            throw "パーサが読み込まれていません";
        JKFPlayer.log("parseKI2", kifu);
        return new JKFPlayer(Normalizer.normalizeKI2(JKFPlayer.ki2Parser.parse(kifu)));
    };
    JKFPlayer.parseCSA = function (kifu) {
        if (!JKFPlayer.csaParser)
            throw "パーサが読み込まれていません";
        JKFPlayer.log("parseCSA", kifu);
        return new JKFPlayer(Normalizer.normalizeCSA(JKFPlayer.csaParser.parse(kifu)));
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
    // 現在の局面から1手入力する．
    // 必要フィールドは，指し: from, to, promote．打ち: to, piece
    // 最終手であれば手を追加，そうでなければ分岐を追加
    // もしpromoteの可能性があればfalseを返して何もしない
    // 成功すればtrueを返す．
    JKFPlayer.prototype.inputMove = function (move) {
        if (move.from != null && move.promote == null) {
            var piece = this.shogi.get(move.from.x, move.from.y);
            if (!Piece.isPromoted(piece.kind) && Piece.canPromote(piece.kind) && (Normalizer.canPromote(move.from, piece.color) || Normalizer.canPromote(move.to, piece.color)))
                return false;
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
        Normalizer.normalizeKIF(this.kifu); // 復元
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
        return {
            color: this.shogi.turn,
            board: this.getBoardState(),
            hands: this.getHandsState()
        };
    };
    JKFPlayer.prototype.getBoardState = function () {
        var ret = [];
        for (var i = 1; i <= 9; i++) {
            var arr = [];
            for (var j = 1; j <= 9; j++) {
                var piece = this.shogi.get(i, j);
                arr.push(piece ? { color: piece.color, kind: piece.kind } : {});
            }
            ret.push(arr);
        }
        return ret;
    };
    JKFPlayer.prototype.getHandsState = function () {
        return [
            this.shogi.getHandsSummary(0 /* Black */),
            this.shogi.getHandsSummary(1 /* White */),
        ];
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
        if (move.from) {
            this.shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
        }
        else {
            this.shogi.drop(move.to.x, move.to.y, move.piece);
        }
    };
    JKFPlayer.prototype.undoMove = function (move) {
        if (move.from) {
            this.shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
        }
        else {
            this.shogi.undrop(move.to.x, move.to.y);
        }
    };
    JKFPlayer.debug = false;
    JKFPlayer._log = [];
    return JKFPlayer;
})();
