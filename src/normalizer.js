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

    function normalizeKIF(obj) {
        var shogi = new Shogi(obj.initial);
        for (var i = 0; i < obj.moves.length; i++) {
            var move = obj.moves[i].move;
            if (!move)
                continue;
            if (move.from) {
                // move
                // sameからto復元
                if (move.same)
                    move.to = obj.moves[i - 1].move.to;

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

                try  {
                    shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
                } catch (e) {
                    throw i + "手目で失敗しました: " + e;
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
        var shogi = new Shogi(obj.initial);
        for (var i = 0; i < obj.moves.length; i++) {
            var move = obj.moves[i].move;
            if (!move)
                continue;

            // 同からto復元
            if (move.same)
                move.to = obj.moves[i - 1].move.to;

            // from復元
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
                // capture復元
                addCaptureInformation(shogi, move);

                try  {
                    shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
                } catch (e) {
                    throw i + "手目で失敗しました: " + e;
                }
            } else {
                // drop
                shogi.drop(move.to.x, move.to.y, move.piece);
            }
        }
        if (obj.result == "中断") {
            obj.moves.push({ special: "CHUDAN" });
        }
        return obj;
    }
    Normalizer.normalizeKI2 = normalizeKI2;
    function normalizeCSA(obj) {
        var shogi = new Shogi(obj.initial);
        for (var i = 0; i < obj.moves.length; i++) {
            var move = obj.moves[i].move;
            if (!move)
                continue;
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
                } else if (Piece.canPromote(move.piece)) {
                    // 不成かも
                    if (canPromote(move.to, shogi.turn) || canPromote(move.from, shogi.turn)) {
                        move.promote = false;
                    }
                }

                // relative復元
                addRelativeInformation(shogi, move);

                try  {
                    shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
                } catch (e) {
                    throw i + "手目で失敗しました: " + e;
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
    Normalizer.normalizeCSA = normalizeCSA;
    function addRelativeInformation(shogi, move) {
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
