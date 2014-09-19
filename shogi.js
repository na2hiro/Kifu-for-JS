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
    };

    // (fromx, fromy)から(tox, toy)へ移動し，適当な処理を行う．
    Shogi.prototype.move = function (fromx, fromy, tox, toy, promote) {
        if (typeof promote === "undefined") { promote = false; }
        if (this.get(tox, toy) != null)
            this.pick(tox, toy);
        var piece = this.get(fromx, fromy);
        if (promote)
            piece.promote();
        this.set(tox, toy, piece);
        this.set(fromx, fromy, null);
    };

    // (tox, toy)へcolorの持ち駒のkindを打つ．
    Shogi.prototype.put = function (tox, toy, kind, color) {
        if (this.get(tox, toy) != null)
            throw "there is a piece at " + tox + ", " + toy;
        var piece = this.popFromHand(kind, color);
        this.set(tox, toy, piece);
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
        return ret.join("\n");
    };

    // (x, y)の駒を得る
    Shogi.prototype.get = function (x, y) {
        return this.board[x - 1][y - 1];
    };

    // (x, y)に駒を置く
    Shogi.prototype.set = function (x, y, piece) {
        this.board[x - 1][y - 1] = piece;
    };

    // (x, y)の駒を取って反対側の持ち駒に加える
    Shogi.prototype.pick = function (x, y) {
        var piece = this.get(x, y);
        this.set(x, y, null);
        piece.unpromote();
        piece.inverse();
        this.pushToHand(piece);
    };

    // 駒pieceを持ち駒に加える
    Shogi.prototype.pushToHand = function (piece) {
        this.hands[piece.color == 0 /* Black */ ? 0 : 1].push(piece);
    };

    // color側のkindの駒を取って返す
    Shogi.prototype.popFromHand = function (kind, color) {
        var hand = this.hands[color == 0 /* Black */ ? 0 : 1];
        for (var i = 0; i < hand.length; i++) {
            if (hand[i].kind != kind)
                continue;
            var piece = hand[i];
            hand.splice(i, 1); // remove at i
            return piece;
        }
        throw color + " has no " + kind;
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
        var newKind = Piece.promote(this.kind);
        if (newKind != null)
            this.kind = newKind;
    };

    // 不成にする
    Piece.prototype.unpromote = function () {
        if (this.isPromoted())
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

    // 現在成っているかどうかを返す
    Piece.prototype.isPromoted = function () {
        return ["TO", "NY", "NK", "NG", "UM", "RY"].indexOf(this.kind) >= 0;
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
        }[kind] || null;
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
        }[kind] || null;
    };
    return Piece;
})();
