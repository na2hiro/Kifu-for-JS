/** @license
* Shogi.js
* Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
* This software is released under the MIT License.
* http://opensource.org/licenses/mit-license.php
*/
var Shogi = (function () {
    function Shogi() {
        this.initialize();
    }
    // 盤面を平手に初期化する
    Shogi.prototype.initialize = function () {
        this.board = [];
        for (var i = 0; i < 9; i++) {
            this.board[i] = [];
            for (var j = 0; j < 9; j++) {
                var csa = Shogi.initialBoard[j].slice(24 - i * 3, 24 - i * 3 + 3);
                this.board[i][j] = csa == " * " ? null : new Piece(csa);
            }
        }
        this.hands = [[], []];
        this.turn = 0 /* Black */;
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
    Shogi.initialBoard = [
        "-KY-KE-GI-KI-OU-KI-GI-KE-KY",
        " * -HI *  *  *  *  * -KA * ",
        "-FU-FU-FU-FU-FU-FU-FU-FU-FU",
        " *  *  *  *  *  *  *  *  * ",
        " *  *  *  *  *  *  *  *  * ",
        " *  *  *  *  *  *  *  *  * ",
        "+FU+FU+FU+FU+FU+FU+FU+FU+FU",
        " * +KA *  *  *  *  * +HI * ",
        "+KY+KE+GI+KI+OU+KI+GI+KE+KY"
    ];
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

    // 成った時の種類を返す．なければnull．
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

    // 成った時の種類を返す．なければnull．
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
        this.shogi = new Shogi();
        this.initialize(kifu);
    }
    JKFPlayer.prototype.initialize = function (kifu) {
        this.kifu = kifu;
        this.tesuu = 0;
    };
    JKFPlayer.parse = function (kifu, filename) {
        if (filename) {
            var tmp = filename.split("."), ext = tmp[tmp.length - 1].toLowerCase();
            switch (ext) {
                case "jkf":
                    return JKFPlayer.parseJKF(kifu);
                case "kif":
                    return JKFPlayer.parseKIF(kifu);
                case "ki2":
                    return JKFPlayer.parseKI2(kifu);
                case "csa":
                    return JKFPlayer.parseCSA(kifu);
            }
        }

        try  {
            return JKFPlayer.parseJKF(kifu);
        } catch (e) {
            console.log("failed to parse as kif", e);
        }
        try  {
            return JKFPlayer.parseKIF(kifu);
        } catch (e) {
            console.log("failed to parse as kif", e);
        }
        try  {
            return JKFPlayer.parseKI2(kifu);
        } catch (e) {
            console.log("failed to parse as ki2", e);
        }
        try  {
            return JKFPlayer.parseCSA(kifu);
        } catch (e) {
            console.log("failed to parse as csa", e);
        }
        throw "KIF, KI2, CSAいずれの形式でも失敗しました";
    };
    JKFPlayer.parseJKF = function (kifu) {
        console.log("parseJKF", kifu);
        return new JKFPlayer(JSON.parse(kifu));
    };
    JKFPlayer.parseKIF = function (kifu) {
        if (!JKFPlayer.kifParser)
            throw "パーサが読み込まれていません";
        console.log("parseKIF", kifu);
        return new JKFPlayer(Normalizer.normalizeKIF(JKFPlayer.kifParser.parse(kifu)));
    };
    JKFPlayer.parseKI2 = function (kifu) {
        if (!JKFPlayer.ki2Parser)
            throw "パーサが読み込まれていません";
        console.log("parseKI2", kifu);
        return new JKFPlayer(Normalizer.normalizeKI2(JKFPlayer.ki2Parser.parse(kifu)));
    };
    JKFPlayer.parseCSA = function (kifu) {
        if (!JKFPlayer.csaParser)
            throw "パーサが読み込まれていません";
        console.log("parseCSA", kifu);
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
            "TORYO": "投了"
        }[special];
    };

    JKFPlayer.prototype.forward = function () {
        if (this.tesuu + 1 >= this.kifu.moves.length)
            return false;
        this.tesuu++;
        var move = this.kifu.moves[this.tesuu].move;
        if (!move)
            return true;
        console.log("forward", this.tesuu, move);
        this.doMove(move);
        return true;
    };
    JKFPlayer.prototype.backward = function () {
        if (this.tesuu <= 0)
            return false;
        var move = this.kifu.moves[this.tesuu].move;
        if (!move) {
            this.tesuu--;
            return true;
        }
        console.log("backward", this.tesuu - 1, move);
        this.undoMove(move);
        this.tesuu--;
        return true;
    };
    JKFPlayer.prototype.goto = function (tesuu) {
        var limit = 10000;
        if (this.tesuu < tesuu) {
            while (this.tesuu != tesuu && this.forward() && limit-- > 0)
                ;
        } else {
            while (this.tesuu != tesuu && this.backward() && limit-- > 0)
                ;
        }
        if (limit == 0)
            throw "tesuu overflows";
    };
    JKFPlayer.prototype.go = function (tesuu) {
        this.goto(this.tesuu + tesuu);
    };

    // wrapper
    JKFPlayer.prototype.getBoard = function (x, y) {
        return this.shogi.get(x, y);
    };
    JKFPlayer.prototype.getHandsSummary = function (color) {
        return this.shogi.getHandsSummary(color);
    };
    JKFPlayer.prototype.getComments = function (tesuu) {
        if (typeof tesuu === "undefined") { tesuu = this.tesuu; }
        return this.kifu.moves[tesuu].comments;
    };
    JKFPlayer.prototype.getMove = function (tesuu) {
        if (typeof tesuu === "undefined") { tesuu = this.tesuu; }
        return this.kifu.moves[tesuu].move;
    };
    JKFPlayer.prototype.getReadableKifu = function (tesuu) {
        if (typeof tesuu === "undefined") { tesuu = this.tesuu; }
        if (tesuu == 0)
            return "開始局面";
        if (this.kifu.moves[tesuu].special) {
            return JKFPlayer.specialToKan(this.kifu.moves[tesuu].special);
        }
        var move = this.kifu.moves[tesuu].move;
        var ret = this.getMoveTurn(tesuu) == 0 /* Black */ ? "☗" : "☖";
        if (move.same) {
            ret += "同　";
        } else {
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
    JKFPlayer.prototype.getMoveTurn = function (tesuu) {
        return tesuu % 2 == 1 ? 0 /* Black */ : 1 /* White */;
    };
    JKFPlayer.prototype.toJKF = function () {
        return JSON.stringify(this.kifu);
    };

    // private
    JKFPlayer.prototype.doMove = function (move) {
        if (move.from) {
            this.shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
        } else {
            this.shogi.drop(move.to.x, move.to.y, move.piece);
        }
    };
    JKFPlayer.prototype.undoMove = function (move) {
        if (move.from) {
            this.shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
        } else {
            this.shogi.undrop(move.to.x, move.to.y);
        }
    };
    return JKFPlayer;
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

    function normalize(obj) {
        switch (obj.type) {
            case "normal":
                return obj;
            case "kif":
                return normalizeKIF(obj);

            default:
                throw "not supported";
        }
    }
    Normalizer.normalize = normalize;

    function normalizeKIF(obj) {
        var shogi = new Shogi();
        for (var i = 0; i < obj.moves.length; i++) {
            var move = obj.moves[i].move;
            if (!move)
                continue;
            console.log(i, move);
            if (move.from) {
                // move
                if (move.same)
                    move.to = obj.moves[i - 1].move.to;
                var to = shogi.get(move.to.x, move.to.y);
                if (to)
                    move.capture = to.kind;
                if (!move.promote && !Piece.isPromoted(move.piece)) {
                    // 成ってない
                    if (canPromote(move.to, shogi.turn) || canPromote(move.from, shogi.turn)) {
                        move.promote = false;
                    }
                }
                var moveVectors = shogi.getMovesTo(move.to.x, move.to.y, move.piece).map(function (mv) {
                    return flipVector(shogi.turn, spaceshipVector(mv.to, mv.from));
                });
                if (moveVectors.length >= 2) {
                    var realVector = flipVector(shogi.turn, spaceshipVector(move.to, move.from));
                    move.relative = function () {
                        // 上下方向唯一
                        if (moveVectors.filter(function (mv) {
                            return mv.y == realVector.y;
                        }).length == 1)
                            return YToUMD(realVector.y);

                        // 左右方向唯一
                        if (moveVectors.filter(function (mv) {
                            return mv.x == realVector.x;
                        }).length == 1) {
                            if ((move.piece == "UM" || move.piece == "RY") && realVector.x == 0) {
                                //直はだめ
                                return XToLCR(moveVectors.filter(function (mv) {
                                    return mv.x < 0;
                                }).length == 0 ? -1 : 1);
                            } else {
                                return XToLCR(realVector.x);
                            }
                        }

                        //上下も左右も他の駒がいる
                        return XToLCR(realVector.x) + YToUMD(realVector.y);
                    }();
                }

                try  {
                    shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
                } catch (e) {
                    console.log(i, "手目で失敗しました", e);
                }
            } else {
                // drop
                if (shogi.getMovesTo(move.to.x, move.to.y, move.piece).length > 0) {
                    move.relative = "H";
                }
                shogi.drop(move.to.x, move.to.y, move.piece);
            }
        }
        return obj;
    }
    Normalizer.normalizeKIF = normalizeKIF;
    function normalizeKI2(obj) {
        var shogi = new Shogi();
        for (var i = 0; i < obj.moves.length; i++) {
            var move = obj.moves[i].move;
            if (!move)
                continue;
            console.log(i, move);
            if (move.same)
                move.to = obj.moves[i - 1].move.to;

            // from特定
            var moves = shogi.getMovesTo(move.to.x, move.to.y, move.piece);
            if (move.relative == "H" || moves.length == 0) {
                // ok
            } else if (moves.length == 1) {
                move.from = moves[0].from;
            } else {
                // 相対逆算
                var moveAns = filterMovesByRelatives(move.relative, shogi.turn, moves);
                if (moveAns.length != 1)
                    throw "相対情報が不完全で複数の候補があります";
                move.from = moveAns[0].from;
            }
            if (move.from) {
                // move
                var to = shogi.get(move.to.x, move.to.y);
                if (to)
                    move.capture = to.kind;

                try  {
                    shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
                } catch (e) {
                    console.log(i, "手目で失敗しました", e);
                }
            } else {
                // drop
                shogi.drop(move.to.x, move.to.y, move.piece);
            }
        }
        return obj;
    }
    Normalizer.normalizeKI2 = normalizeKI2;
    function normalizeCSA(obj) {
        throw "not implemented";
    }
    Normalizer.normalizeCSA = normalizeCSA;
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
            if (relative.split("").every(function (rel) {
                return moveSatisfiesRelative(rel, color, moves[i]);
            })) {
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
})(Normalizer || (Normalizer = {}));
JKFPlayer.kifParser = (function() {
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
        peg$c2 = function(headers, moves, res) {return {header:headers, moves:moves,result:res, type:"kif"}},
        peg$c3 = "#",
        peg$c4 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c5 = [],
        peg$c6 = "",
        peg$c7 = function(h, hs) { hs[h.k]=h.v; return hs;},
        peg$c8 = function() {return {}},
        peg$c9 = /^[^\uFF1A\r\n]/,
        peg$c10 = { type: "class", value: "[^\\uFF1A\\r\\n]", description: "[^\\uFF1A\\r\\n]" },
        peg$c11 = "\uFF1A",
        peg$c12 = { type: "literal", value: "\uFF1A", description: "\"\\uFF1A\"" },
        peg$c13 = function(key, value) {return {k:key.join(""), v:value.join("")}},
        peg$c14 = "\u624B\u6570----\u6307\u624B--",
        peg$c15 = { type: "literal", value: "\u624B\u6570----\u6307\u624B--", description: "\"\\u624B\\u6570----\\u6307\\u624B--\"" },
        peg$c16 = "-------\u6D88\u8CBB\u6642\u9593--",
        peg$c17 = { type: "literal", value: "-------\u6D88\u8CBB\u6642\u9593--", description: "\"-------\\u6D88\\u8CBB\\u6642\\u9593--\"" },
        peg$c18 = function(hd, tl) {tl.unshift(hd); return tl;},
        peg$c19 = function(c) {return {comments:c}},
        peg$c20 = function(line, c) {var ret = {comments: c, time: line.time}; if(typeof line.move=="object"){ret.move=line.move;}else{ret.special=specialToCSA(line.move)} return ret;},
        peg$c21 = "&",
        peg$c22 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c23 = " ",
        peg$c24 = { type: "literal", value: " ", description: "\" \"" },
        peg$c25 = function(fugou, from) {var ret = {from: from, piece: fugou.piece}; if(fugou.to){ret.to=fugou.to}else{ret.same=true};if(fugou.promote)ret.promote=true; return ret;},
        peg$c26 = "\u6295\u4E86",
        peg$c27 = { type: "literal", value: "\u6295\u4E86", description: "\"\\u6295\\u4E86\"" },
        peg$c28 = function(move, time) {return {move: move, time: time}},
        peg$c29 = /^[0-9]/,
        peg$c30 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c31 = "\u6210",
        peg$c32 = { type: "literal", value: "\u6210", description: "\"\\u6210\"" },
        peg$c33 = function(pl, pi, pro) {return {to:pl, piece: pi,promote:!!pro};},
        peg$c34 = function(x, y) {return {x:x,y:y}},
        peg$c35 = "\u540C\u3000",
        peg$c36 = { type: "literal", value: "\u540C\u3000", description: "\"\\u540C\\u3000\"" },
        peg$c37 = function() {return null},
        peg$c38 = /^[\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]/,
        peg$c39 = { type: "class", value: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]", description: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]" },
        peg$c40 = function(n) {return zenToN(n);},
        peg$c41 = /^[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]/,
        peg$c42 = { type: "class", value: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]", description: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]" },
        peg$c43 = function(n) {return kanToN(n);},
        peg$c44 = /^[\u6B69\u9999\u6842\u9280\u91D1\u89D2\u98DB\u738B\u7389\u3068\u674F\u572D\u5168\u99AC\u7ADC\u9F8D]/,
        peg$c45 = { type: "class", value: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]", description: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]" },
        peg$c46 = function(pro, p) {return kindToCSA((pro||"")+p);},
        peg$c47 = "\u6253",
        peg$c48 = { type: "literal", value: "\u6253", description: "\"\\u6253\"" },
        peg$c49 = "(",
        peg$c50 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c51 = /^[1-9]/,
        peg$c52 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c53 = ")",
        peg$c54 = { type: "literal", value: ")", description: "\")\"" },
        peg$c55 = function(x, y) {return {x:parseInt(x),y:parseInt(y)}},
        peg$c56 = "/",
        peg$c57 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c58 = function(now, total) {return {now: now, total: total}},
        peg$c59 = ":",
        peg$c60 = { type: "literal", value: ":", description: "\":\"" },
        peg$c61 = function(h, m, s) {return {h:toN(h),m:toN(m),s:toN(s)}},
        peg$c62 = function(m, s) {return {m:toN(m),s:toN(s)}},
        peg$c63 = "*",
        peg$c64 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c65 = function(comm) {return comm.join("")},
        peg$c66 = "\u307E\u3067",
        peg$c67 = { type: "literal", value: "\u307E\u3067", description: "\"\\u307E\\u3067\"" },
        peg$c68 = "\u624B\u3067",
        peg$c69 = { type: "literal", value: "\u624B\u3067", description: "\"\\u624B\\u3067\"" },
        peg$c70 = /^[\u5148\u5F8C]/,
        peg$c71 = { type: "class", value: "[\\u5148\\u5F8C]", description: "[\\u5148\\u5F8C]" },
        peg$c72 = "\u624B\u306E\u52DD\u3061",
        peg$c73 = { type: "literal", value: "\u624B\u306E\u52DD\u3061", description: "\"\\u624B\\u306E\\u52DD\\u3061\"" },
        peg$c74 = function(win) {return win[0]},
        peg$c75 = "\r",
        peg$c76 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c77 = "\n",
        peg$c78 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c79 = /^[^\r\n]/,
        peg$c80 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },

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
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseversion();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseheaders();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesplit();
          if (s3 === peg$FAILED) {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemoves();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseresult();
              if (s5 === peg$FAILED) {
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c2(s2, s4, s5);
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

    function peg$parseversion() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c3;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
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
      if (s0 === peg$FAILED) {
        s0 = peg$c6;
      }

      return s0;
    }

    function peg$parseheaders() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseheader();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseheaders();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c7(s1, s2);
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
        s1 = peg$c6;
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c8();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseheader() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c9.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c10); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c9.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c10); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 65306) {
          s2 = peg$c11;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c12); }
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
              s1 = peg$c13(s1, s3);
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

    function peg$parsesplit() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10) === peg$c14) {
        s1 = peg$c14;
        peg$currPos += 10;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 13) === peg$c16) {
          s2 = peg$c16;
          peg$currPos += 13;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
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
          peg$reportedPos = s0;
          s1 = peg$c18(s1, s2);
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
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c19(s1);
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
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c20(s1, s2);
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
        s1 = peg$c21;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c22); }
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
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c23;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c23;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsete();
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (input.charCodeAt(peg$currPos) === 32) {
            s4 = peg$c23;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (input.charCodeAt(peg$currPos) === 32) {
              s4 = peg$c23;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c24); }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsefugou();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsefrom();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s4;
                s5 = peg$c25(s5, s6);
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
              if (input.substr(peg$currPos, 2) === peg$c26) {
                s4 = peg$c26;
                peg$currPos += 2;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c27); }
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              if (input.charCodeAt(peg$currPos) === 32) {
                s6 = peg$c23;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c24); }
              }
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (input.charCodeAt(peg$currPos) === 32) {
                  s6 = peg$c23;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
                }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsetime();
                if (s6 === peg$FAILED) {
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsenl();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c28(s4, s6);
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

      return s0;
    }

    function peg$parsete() {
      var s0, s1;

      s0 = [];
      if (peg$c29.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c29.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
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
            s3 = peg$c31;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c33(s1, s2, s3);
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
          s1 = peg$c34(s1, s2);
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
        if (input.substr(peg$currPos, 2) === peg$c35) {
          s1 = peg$c35;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c37();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsenum() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c38.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c40(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenumkan() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c41.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c43(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsepiece() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 25104) {
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        if (peg$c44.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c45); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c46(s1, s2);
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
        s1 = peg$c47;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c48); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c37();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
          s1 = peg$c49;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c50); }
        }
        if (s1 !== peg$FAILED) {
          if (peg$c51.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c52); }
          }
          if (s2 !== peg$FAILED) {
            if (peg$c51.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c52); }
            }
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s4 = peg$c53;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c54); }
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c55(s2, s3);
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
        s1 = peg$c49;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c50); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c23;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c23;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsems();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s4 = peg$c56;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c57); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsehms();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 41) {
                  s6 = peg$c53;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c54); }
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c58(s3, s5);
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
      if (peg$c29.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c29.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c59;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c60); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c29.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c29.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c30); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c59;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              if (peg$c29.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c30); }
              }
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  if (peg$c29.test(input.charAt(peg$currPos))) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c30); }
                  }
                }
              } else {
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c61(s1, s3, s5);
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
      if (peg$c29.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c29.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c59;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c60); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c29.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c29.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c30); }
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c62(s1, s3);
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
        s1 = peg$c63;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c64); }
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
            s1 = peg$c65(s2);
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
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c66) {
        s1 = peg$c66;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c29.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c30); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c29.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c30); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c68) {
            s3 = peg$c68;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c69); }
          }
          if (s3 !== peg$FAILED) {
            if (peg$c70.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c71); }
            }
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c72) {
                s5 = peg$c72;
                peg$currPos += 4;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c73); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsenl();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c74(s4);
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
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 13) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c77;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c78); }
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

      if (peg$c79.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c80); }
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
    			"投了": "TORYO"
    		}[str];
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
JKFPlayer.ki2Parser = (function() {
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
        peg$c2 = function(headers, moves, res) { return {header:headers, moves:moves, result:res, type:"ki2"} },
        peg$c3 = function(h, hs) { hs[h.k]=h.v; return hs;},
        peg$c4 = "",
        peg$c5 = function() {return {}},
        peg$c6 = [],
        peg$c7 = /^[^\uFF1A\r\n]/,
        peg$c8 = { type: "class", value: "[^\\uFF1A\\r\\n]", description: "[^\\uFF1A\\r\\n]" },
        peg$c9 = "\uFF1A",
        peg$c10 = { type: "literal", value: "\uFF1A", description: "\"\\uFF1A\"" },
        peg$c11 = function(key, value) { return {k:key.join(""), v:value.join("")}},
        peg$c12 = function(hd, tl) {tl.unshift(hd); return tl;},
        peg$c13 = function(c) {return {comments:c}},
        peg$c14 = " ",
        peg$c15 = { type: "literal", value: " ", description: "\" \"" },
        peg$c16 = function(line, c) { return {comments:c, move: line } },
        peg$c17 = "&",
        peg$c18 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c19 = /^[\u25B2\u25B3]/,
        peg$c20 = { type: "class", value: "[\\u25B2\\u25B3]", description: "[\\u25B2\\u25B3]" },
        peg$c21 = function(f) {return f},
        peg$c22 = "\u6210",
        peg$c23 = { type: "literal", value: "\u6210", description: "\"\\u6210\"" },
        peg$c24 = "\u4E0D\u6210",
        peg$c25 = { type: "literal", value: "\u4E0D\u6210", description: "\"\\u4E0D\\u6210\"" },
        peg$c26 = "\u6253",
        peg$c27 = { type: "literal", value: "\u6253", description: "\"\\u6253\"" },
        peg$c28 = function(pl, pi, sou, dou, pro, da) {
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
        peg$c29 = function(x, y) {return {x:x,y:y}},
        peg$c30 = "\u540C",
        peg$c31 = { type: "literal", value: "\u540C", description: "\"\\u540C\"" },
        peg$c32 = "\u3000",
        peg$c33 = { type: "literal", value: "\u3000", description: "\"\\u3000\"" },
        peg$c34 = function() {return {same:true}},
        peg$c35 = /^[\u6B69\u9999\u6842\u9280\u91D1\u89D2\u98DB\u738B\u7389\u3068\u674F\u572D\u5168\u99AC\u7ADC\u9F8D]/,
        peg$c36 = { type: "class", value: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]", description: "[\\u6B69\\u9999\\u6842\\u9280\\u91D1\\u89D2\\u98DB\\u738B\\u7389\\u3068\\u674F\\u572D\\u5168\\u99AC\\u7ADC\\u9F8D]" },
        peg$c37 = function(pro, p) {return kindToCSA((pro||"")+p)},
        peg$c38 = /^[\u5DE6\u76F4\u53F3]/,
        peg$c39 = { type: "class", value: "[\\u5DE6\\u76F4\\u53F3]", description: "[\\u5DE6\\u76F4\\u53F3]" },
        peg$c40 = /^[\u4E0A\u5BC4\u5F15]/,
        peg$c41 = { type: "class", value: "[\\u4E0A\\u5BC4\\u5F15]", description: "[\\u4E0A\\u5BC4\\u5F15]" },
        peg$c42 = /^[\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]/,
        peg$c43 = { type: "class", value: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]", description: "[\\uFF11\\uFF12\\uFF13\\uFF14\\uFF15\\uFF16\\uFF17\\uFF18\\uFF19]" },
        peg$c44 = function(n) {return zenToN(n);},
        peg$c45 = /^[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]/,
        peg$c46 = { type: "class", value: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]", description: "[\\u4E00\\u4E8C\\u4E09\\u56DB\\u4E94\\u516D\\u4E03\\u516B\\u4E5D]" },
        peg$c47 = function(n) {return kanToN(n);},
        peg$c48 = "*",
        peg$c49 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c50 = function(comm) {return comm.join("")},
        peg$c51 = "\u307E\u3067",
        peg$c52 = { type: "literal", value: "\u307E\u3067", description: "\"\\u307E\\u3067\"" },
        peg$c53 = /^[0-9]/,
        peg$c54 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c55 = "\u624B\u3067",
        peg$c56 = { type: "literal", value: "\u624B\u3067", description: "\"\\u624B\\u3067\"" },
        peg$c57 = /^[\u5148\u5F8C]/,
        peg$c58 = { type: "class", value: "[\\u5148\\u5F8C]", description: "[\\u5148\\u5F8C]" },
        peg$c59 = "\u624B\u306E\u52DD\u3061",
        peg$c60 = { type: "literal", value: "\u624B\u306E\u52DD\u3061", description: "\"\\u624B\\u306E\\u52DD\\u3061\"" },
        peg$c61 = function(win) {return win[0]},
        peg$c62 = "\r",
        peg$c63 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c64 = "\n",
        peg$c65 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c66 = /^[^\r\n]/,
        peg$c67 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },

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
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseheaders();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsemoves();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseresult();
          if (s3 === peg$FAILED) {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c2(s1, s2, s3);
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

    function peg$parseheaders() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseheader();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseheaders();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c3(s1, s2);
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
        s1 = peg$c4;
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c5();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseheader() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c7.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c7.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 65306) {
          s2 = peg$c9;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c10); }
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
              s1 = peg$c11(s1, s3);
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
          peg$reportedPos = s0;
          s1 = peg$c12(s1, s2);
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
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
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
            s3 = peg$c1;
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
              s1 = peg$c16(s1, s2);
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
        s1 = peg$c17;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c18); }
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
      if (peg$c19.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
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
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsedousa();
            if (s4 === peg$FAILED) {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 25104) {
                s5 = peg$c22;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              if (s5 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c24) {
                  s5 = peg$c24;
                  peg$currPos += 2;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c25); }
                }
              }
              if (s5 === peg$FAILED) {
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 25171) {
                  s6 = peg$c26;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c27); }
                }
                if (s6 === peg$FAILED) {
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c28(s1, s2, s3, s4, s5, s6);
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
          s1 = peg$c29(s1, s2);
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
          s1 = peg$c30;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c31); }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 12288) {
            s2 = peg$c32;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c33); }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$c1;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c34();
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
        s1 = peg$c22;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        if (peg$c35.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c37(s1, s2);
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

      if (peg$c38.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }

      return s0;
    }

    function peg$parsedousa() {
      var s0;

      if (peg$c40.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }

      return s0;
    }

    function peg$parsenum() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c42.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c44(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenumkan() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c45.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c46); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c47(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c48;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
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
            s1 = peg$c50(s2);
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
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c51) {
        s1 = peg$c51;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c53.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c53.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c54); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c55) {
            s3 = peg$c55;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
          }
          if (s3 !== peg$FAILED) {
            if (peg$c57.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c58); }
            }
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c59) {
                s5 = peg$c59;
                peg$currPos += 4;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsenl();
                if (s6 === peg$FAILED) {
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c61(s4);
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
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 13) {
        s1 = peg$c62;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c63); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c64;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
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

      if (peg$c66.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
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
JKFPlayer.csaParser = (function() {
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
        peg$c2 = function(p, s, ms) { return {players:p, start:s, moves:ms, type:"csa"} },
        peg$c3 = [],
        peg$c4 = "N+",
        peg$c5 = { type: "literal", value: "N+", description: "\"N+\"" },
        peg$c6 = function(n) { return n },
        peg$c7 = "N-",
        peg$c8 = { type: "literal", value: "N-", description: "\"N-\"" },
        peg$c9 = function(n) { return n},
        peg$c10 = function(sen, go) { return [sen.join(""), go.join("")] },
        peg$c11 = function(board, teban) {return {board:board, teban: teban}},
        peg$c12 = "PI",
        peg$c13 = { type: "literal", value: "PI", description: "\"PI\"" },
        peg$c14 = "P",
        peg$c15 = { type: "literal", value: "P", description: "\"P\"" },
        peg$c16 = /^[1-9]/,
        peg$c17 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c18 = function(masu) { return masu; },
        peg$c19 = " * ",
        peg$c20 = { type: "literal", value: " * ", description: "\" * \"" },
        peg$c21 = function() { return [] },
        peg$c22 = function(hd, tl) {tl.unshift(hd); return tl;},
        peg$c23 = function(c) {return {comments:c}},
        peg$c24 = function(comment, move, time) { return {comment:comment, move:move, time:time} },
        peg$c25 = function(from, to, piece) { return {from:from.x==0?null:from, to:to, piece:piece}},
        peg$c26 = "%",
        peg$c27 = { type: "literal", value: "%", description: "\"%\"" },
        peg$c28 = /^[A-Z]/,
        peg$c29 = { type: "class", value: "[A-Z]", description: "[A-Z]" },
        peg$c30 = function(m) { return {special: m.join("")}; },
        peg$c31 = "+",
        peg$c32 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c33 = "-",
        peg$c34 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c35 = "'",
        peg$c36 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c37 = function(c) { return c.join(""); },
        peg$c38 = "T",
        peg$c39 = { type: "literal", value: "T", description: "\"T\"" },
        peg$c40 = /^[0-9]/,
        peg$c41 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c42 = function(t) { return {now: secToTime(parseInt(t.join("")))}; },
        peg$c43 = function(x, y) { return {x:parseInt(x), y:parseInt(y)}; },
        peg$c44 = function(a, b) { return a+b; },
        peg$c45 = function(xy, piece) {return {xy:xy, piece:piece}},
        peg$c46 = "\r",
        peg$c47 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c48 = "\n",
        peg$c49 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c50 = " ",
        peg$c51 = { type: "literal", value: " ", description: "\" \"" },
        peg$c52 = ",",
        peg$c53 = { type: "literal", value: ",", description: "\",\"" },
        peg$c54 = /^[^\r\n]/,
        peg$c55 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },

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
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseplayers();
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsestartboard();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsemoves();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c2(s1, s2, s3);
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
        if (input.substr(peg$currPos, 2) === peg$c4) {
          s3 = peg$c4;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c5); }
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
              s3 = peg$c6(s4);
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
            if (input.substr(peg$currPos, 2) === peg$c7) {
              s5 = peg$c7;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
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
                  s5 = peg$c9(s6);
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
              s1 = peg$c10(s2, s4);
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

    function peg$parsestartboard() {
      var s0, s1, s2, s3, s4, s5;

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
            s2 = peg$parsekomabetsu();
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsecomment();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsecomment();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseteban();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenl();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c11(s2, s4);
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

    function peg$parsehirate() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c12) {
        s1 = peg$c12;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsexypiece();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsexypiece();
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

    function peg$parseikkatsu() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseikkatsuline();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseikkatsuline();
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseikkatsuline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 80) {
        s1 = peg$c14;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c16.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
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

    function peg$parsemasu() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseteban();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepiece();
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
        if (input.substr(peg$currPos, 3) === peg$c19) {
          s1 = peg$c19;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c21();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsekomabetsu() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsekomabetsuline();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsekomabetsuline();
      }

      return s0;
    }

    function peg$parsekomabetsuline() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 80) {
        s1 = peg$c14;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
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
              s1 = [s1, s2, s3, s4];
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
        s1 = peg$c23(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemove() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsecomment();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsecomment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenormalmove();
        if (s2 === peg$FAILED) {
          s2 = peg$parsespecialmove();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsetime();
          if (s3 === peg$FAILED) {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c24(s1, s2, s3);
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
                s1 = peg$c25(s2, s3, s4);
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
        s1 = peg$c26;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c28.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c29); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c28.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c29); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c30(s2);
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
      var s0;

      if (input.charCodeAt(peg$currPos) === 43) {
        s0 = peg$c31;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s0 = peg$c33;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c34); }
        }
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c35;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
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
            s1 = peg$c37(s2);
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
        s1 = peg$c38;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c40.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c41); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c40.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenl();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c42(s2);
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
      if (peg$c40.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c40.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c41); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c43(s1, s2);
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
      if (peg$c28.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c28.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c29); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c44(s1, s2);
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
          s1 = peg$c45(s1, s2);
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
        s1 = peg$c46;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c48;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
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
          s2 = peg$c50;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c51); }
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c50;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c51); }
          }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s2 = peg$c52;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c53); }
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

      if (peg$c54.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
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
