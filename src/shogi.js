/** @license
* Shogi.js
* Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
* This software is released under the MIT License.
* http://opensource.org/licenses/mit-license.php
*/
var Shogi = (function () {
    function Shogi(setting) {
        this.initialize(setting);
    }
    // 盤面を平手に初期化する
    Shogi.prototype.initialize = function (setting) {
        if (typeof setting === "undefined") { setting = { preset: "HIRATE" }; }
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
        } else {
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
                    var csa = (c == 0 ? "+" : "-") + p;
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
        if (typeof promote === "undefined") { promote = false; }
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
        if (typeof promote === "undefined") { promote = false; }
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
        if (typeof color === "undefined") { color = this.turn; }
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
        if (typeof color === "undefined") { color = this.turn; }
        var to = { x: x, y: y };
        var ret = [];
        for (var i = 1; i <= 9; i++) {
            for (var j = 1; j <= 9; j++) {
                var piece = this.get(i, j);
                if (!piece || piece.kind != kind || piece.color != color)
                    continue;
                var moves = this.getMovesFrom(i, j);
                if (moves.some(function (move) {
                    return move.to.x == x && move.to.y == y;
                })) {
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
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
                return { just: [[0, -1]] };
            case "KY":
                return { fly: [[0, -1]] };
            case "KE":
                return { just: [[-1, -2], [1, -2]] };
            case "GI":
                return { just: [[-1, -1], [0, -1], [1, -1], [-1, 1], [1, 1]] };
            case "KI":
            case "TO":
            case "NY":
            case "NK":
            case "NG":
                return { just: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] };
            case "KA":
                return { fly: [[-1, -1], [1, -1], [-1, 1], [1, 1]] };
            case "HI":
                return { fly: [[0, -1], [-1, 0], [1, 0], [0, 1]] };
            case "OU":
                return { just: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] };
            case "UM":
                return { fly: [[-1, -1], [1, -1], [-1, 1], [1, 1]], just: [[0, -1], [-1, 0], [1, 0], [0, 1]] };
            case "RY":
                return { fly: [[0, -1], [-1, 0], [1, 0], [0, 1]], just: [[-1, -1], [1, -1], [-1, 1], [1, 1]] };
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
