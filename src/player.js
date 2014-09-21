/// <reference path="./JSONKifuFormat.d.ts" />
/// <reference path="../Shogi.js/src/shogi.ts" />
var Player = (function () {
    function Player(kifu) {
        this.shogi = new Shogi();
        this.initialize(kifu);
    }
    Player.prototype.initialize = function (kifu) {
        this.kifu = kifu;
        this.tesuu = 0;
    };
    Player.prototype.forward = function () {
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
    Player.prototype.backward = function () {
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

    Player.prototype.doMove = function (move) {
        if (move.from) {
            this.shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
        } else {
            this.shogi.drop(move.to.x, move.to.y, move.piece);
        }
    };
    Player.prototype.undoMove = function (move) {
        if (move.from) {
            this.shogi.unmove(move.from.x, move.from.y, move.to.x, move.to.y, move.promote, move.capture);
        } else {
            this.shogi.undrop(move.to.x, move.to.y);
        }
    };
    return Player;
})();
