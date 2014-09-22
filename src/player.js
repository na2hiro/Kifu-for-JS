/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />
/// <reference path="./normalizer.ts" />
var JKFPlayer = (function () {
    function JKFPlayer(kifu) {
        this.shogi = new Shogi();
        this.initialize(kifu);
    }
    JKFPlayer.prototype.initialize = function (kifu) {
        this.kifu = kifu;
        this.tesuu = 0;
    };
    JKFPlayer.parseKIF = function (kifu) {
        if (!JKFPlayer.kifParser)
            throw "パーサが読み込まれていません";
        return new JKFPlayer(Normalizer.normalizeKIF(JKFPlayer.kifParser.parse(kifu)));
    };
    JKFPlayer.parseKI2 = function (kifu) {
        if (!JKFPlayer.ki2Parser)
            throw "パーサが読み込まれていません";
        return new JKFPlayer(Normalizer.normalizeKI2(JKFPlayer.ki2Parser.parse(kifu)));
    };
    JKFPlayer.parseCSA = function (kifu) {
        if (!JKFPlayer.csaParser)
            throw "パーサが読み込まれていません";
        return new JKFPlayer(Normalizer.normalizeCSA(JKFPlayer.csaParser.parse(kifu)));
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
            while (this.tesuu != tesuu && limit-- > 0)
                this.forward();
        } else {
            while (this.tesuu != tesuu && limit-- > 0)
                this.backward();
        }
    };

    // wrapper
    JKFPlayer.prototype.getBoard = function (x, y) {
        return this.shogi.get(x, y);
    };
    JKFPlayer.prototype.getHandsSummary = function (color) {
        return this.shogi.getHandsSummary(color);
    };
    JKFPlayer.prototype.getNowComments = function () {
        return this.kifu.moves[this.tesuu].comments;
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
