/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import {Color, IMove, Piece, Shogi} from "shogi.js";
import {IJSONKifuFormat, IMoveFormat, IMoveMoveFormat, IPlaceFormat, ITimeFormat} from "./Formats";

export function canPromote(place: IPlaceFormat, color: Color) {
    return color === Color.Black ? place.y <= 3 : place.y >= 7;
}

// 最小形式の棋譜をnormalizeする
// 最小形式: (指し) from, to, promote; (打ち) piece, to
export function normalizeMinimal(obj: IJSONKifuFormat): IJSONKifuFormat {
    const shogi = new Shogi(obj.initial);
    normalizeMinimalMoves(shogi, obj.moves);
    return obj;
}
function normalizeMinimalMoves(shogi: Shogi, moves: IMoveFormat[], lastMove?: IMoveFormat) {
    for (let i = 0; i < moves.length; i++) {
        const last = i === 0 ? lastMove : moves[i - 1];
        const move = moves[i].move;
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
            } catch (e) {
                throw new Error(i + "手目で失敗しました: " + e);
            }
        } else {
            // drop
            if (shogi.getMovesTo(move.to.x, move.to.y, move.piece).length > 0) {
                move.relative = "H";
            }
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    restoreColorOfIllegalAction(moves, shogi);
    for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i].move;
        if (move) {
            if (move.from) {
                shogi.unmove(
                    move.from.x,
                    move.from.y,
                    move.to.x,
                    move.to.y,
                    move.promote,
                    move.capture
                );
            } else {
                shogi.undrop(move.to.x, move.to.y);
            }
        }
        const last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (const fork of moves[i].forks) {
                normalizeMinimalMoves(shogi, fork, last);
            }
        }
    }
}
/**
 * Normalize JKF
 * @param obj JKF. TODO: Introduce a type which is not a normalized KIF
 */
export function normalizeKIF(obj: IJSONKifuFormat): IJSONKifuFormat {
    // Kifu for iPhone bug
    if (obj.initial && obj.initial.preset === "HIRATE" && obj.initial.data) {
        obj.initial.preset = "OTHER";
    }
    const shogi = new Shogi(obj.initial || undefined);
    normalizeKIFMoves(shogi, obj.moves);
    return obj;
}
function normalizeKIFMoves(shogi: Shogi, moves: IMoveFormat[], lastMove?: IMoveFormat) {
    for (let i = 0; i < moves.length; i++) {
        const last = i === 0 ? lastMove : moves[i - 1];
        const move = moves[i].move;
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
            } catch (e) {
                throw new Error(i + "手目で失敗しました: " + e);
            }
        } else {
            // drop
            if (shogi.getMovesTo(move.to.x, move.to.y, move.piece).length > 0) {
                move.relative = "H";
            }
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    restoreColorOfIllegalAction(moves, shogi);
    for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i].move;
        if (move) {
            if (move.from) {
                shogi.unmove(
                    move.from.x,
                    move.from.y,
                    move.to.x,
                    move.to.y,
                    move.promote,
                    move.capture
                );
            } else {
                shogi.undrop(move.to.x, move.to.y);
            }
        }
        const last = i === 0 ? lastMove : moves[i - 1]; // When first fork has fork, use lastMove of this fork
        if (moves[i].forks) {
            for (const fork of moves[i].forks) {
                normalizeKIFMoves(shogi, fork, last);
            }
        }
    }
}
export function normalizeKI2(obj: IJSONKifuFormat): IJSONKifuFormat {
    const shogi = new Shogi(obj.initial || undefined);
    normalizeKI2Moves(shogi, obj.moves);
    return obj;
}
function normalizeKI2Moves(shogi: Shogi, moves: IMoveFormat[], lastMove?: IMoveFormat) {
    for (let i = 0; i < moves.length; i++) {
        const last = i === 0 ? lastMove : moves[i - 1];
        const move = moves[i].move;
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
        const candMoves = shogi.getMovesTo(move.to.x, move.to.y, move.piece);
        if (move.relative === "H" || candMoves.length === 0) {
            // ok
        } else if (candMoves.length === 1) {
            move.from = candMoves[0].from;
        } else {
            // 相対逆算
            const moveAns = filterMovesByRelatives(move.relative, shogi.turn, candMoves);
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
            } catch (e) {
                throw new Error(i + "手目で失敗しました: " + e);
            }
        } else {
            // drop
            shogi.drop(move.to.x, move.to.y, move.piece);
        }
    }
    restoreColorOfIllegalAction(moves, shogi);
    for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i].move;
        if (!move) {
            continue;
        }
        if (move.from) {
            shogi.unmove(
                move.from.x,
                move.from.y,
                move.to.x,
                move.to.y,
                move.promote,
                move.capture
            );
        } else {
            shogi.undrop(move.to.x, move.to.y);
        }
        const last = i <= 1 ? lastMove : moves[i - 1];
        if (moves[i].forks) {
            for (const fork of moves[i].forks) {
                normalizeKI2Moves(shogi, fork, last);
            }
        }
    }
}
export function normalizeCSA(obj: IJSONKifuFormat): IJSONKifuFormat {
    restorePreset(obj);
    const shogi = new Shogi(obj.initial || undefined);
    for (let i = 0; i < obj.moves.length; i++) {
        restoreTotalTime(obj.moves[i].time, i >= 2 ? obj.moves[i - 2].time : void 0);
        const move = obj.moves[i].move;
        if (!move) {
            continue;
        }
        // 手番
        move.color = shogi.turn;
        if (move.from) {
            // move

            // same復元
            if (
                i > 0 &&
                obj.moves[i - 1].move &&
                obj.moves[i - 1].move.to.x === move.to.x &&
                obj.moves[i - 1].move.to.y === move.to.y
            ) {
                move.same = true;
            }

            // capture復元
            addCaptureInformation(shogi, move);
            if (Piece.isPromoted(move.piece)) {
                // 成かも
                const from = shogi.get(move.from.x, move.from.y);
                if (from.kind !== move.piece) {
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

            try {
                shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
            } catch (e) {
                throw new Error(i + "手目で失敗しました: " + e);
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
// export for testing
export function addRelativeInformation(shogi: Shogi, move: IMoveMoveFormat) {
    const moveVectors = shogi
        .getMovesTo(move.to.x, move.to.y, move.piece)
        .map((mv) => flipVector(shogi.turn, spaceshipVector(mv.to, mv.from)));
    if (moveVectors.length >= 2) {
        const realVector = flipVector(shogi.turn, spaceshipVector(move.to, move.from));
        move.relative = (() => {
            // 上下方向唯一
            if (moveVectors.filter((mv) => mv.y === realVector.y).length === 1) {
                return YToUMD(realVector.y);
            }
            // 左右方向唯一
            if (moveVectors.filter((mv) => mv.x === realVector.x).length === 1) {
                if ((move.piece === "UM" || move.piece === "RY") && realVector.x === 0) {
                    // 直はだめ
                    return XToLCR(moveVectors.filter((mv) => mv.x < 0).length === 0 ? -1 : 1);
                } else {
                    return XToLCR(realVector.x);
                }
            }
            // 上下も左右も他の駒がいる
            if (realVector.x === 0) {
                // 直は上下とは使わない
                return XToLCR(realVector.x);
            }
            return XToLCR(realVector.x) + YToUMD(realVector.y);
        })();
    }
}
function addCaptureInformation(shogi: Shogi, move: IMoveMoveFormat) {
    const to = shogi.get(move.to.x, move.to.y);
    if (to) {
        move.capture = to.kind;
    }
}

function flipVector(color: Color, vector: {x: number; y: number}) {
    return color === Color.Black ? vector : {x: -vector.x, y: -vector.y};
}
function spaceship(a: number, b: number) {
    return a === b ? 0 : a > b ? 1 : -1;
}
function spaceshipVector(a: {x: number; y: number}, b: {x: number; y: number}) {
    return {x: spaceship(a.x, b.x), y: spaceship(a.y, b.y)};
}
// yの段から移動した場合の相対情報
function YToUMD(y: number) {
    return y === 0 ? "M" : y > 0 ? "D" : "U";
}
// xの行から移動した場合の相対情報
function XToLCR(x: number) {
    return x === 0 ? "C" : x > 0 ? "R" : "L";
}
export function filterMovesByRelatives(relative: string, color: Color, moves: IMove[]): IMove[] {
    let candidates = moves
        .map((move) => ({
            move,
            vec: flipVector(color, {x: move.to.x - move.from.x, y: move.to.y - move.from.y}),
        }))
        .filter(({vec}) =>
            relative.split("").every((rel) => moveSatisfiesRelative(rel, color, vec))
        );
    if (relative.indexOf("C") >= 0) {
        // 直は上がる時だけ
        candidates = candidates.filter(({vec}) => vec.y < 0);
    }
    if (relative.indexOf("L") >= 0) {
        let min = Infinity;
        candidates.forEach(({vec}) => (min = Math.min(min, vec.x)));
        return candidates.filter(({vec}) => vec.x === min).map(({move}) => move);
    }
    if (relative.indexOf("R") >= 0) {
        let max = -Infinity;
        candidates.forEach(({vec}) => (max = Math.max(max, vec.x)));
        return candidates.filter(({vec}) => vec.x === max).map(({move}) => move);
    }
    return candidates.map(({move}) => move);
}
function moveSatisfiesRelative(
    relative: string,
    color: Color,
    vec: {x: number; y: number}
): boolean {
    switch (relative) {
        case "U":
            return vec.y < 0;
        case "M":
            return vec.y === 0;
        case "D":
            return vec.y > 0;
        case "C":
            return vec.x === 0;
        case "L":
        case "R":
            // 移動先ではなく他の駒との相対的な位置関係のため後で判定
            return true;
    }
}
// CSA等で盤面みたままで表現されているものをpresetに戻せれば戻す
function restorePreset(obj: IJSONKifuFormat) {
    if (!obj.initial || obj.initial.preset !== "OTHER") {
        return;
    }
    const kinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI"];
    for (let i = 0; i < 2; i++) {
        for (const kind of kinds) {
            if (obj.initial.data.hands[i][kind] !== 0) {
                return;
            }
        }
    }
    const hirate = [
        [
            {color: Color.White, kind: "KY"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "KY"},
        ],
        [
            {color: Color.White, kind: "KE"},
            {color: Color.White, kind: "KA"},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {color: Color.Black, kind: "HI"},
            {color: Color.Black, kind: "KE"},
        ],
        [
            {color: Color.White, kind: "GI"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "GI"},
        ],
        [
            {color: Color.White, kind: "KI"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "KI"},
        ],
        [
            {color: Color.White, kind: "OU"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "OU"},
        ],
        [
            {color: Color.White, kind: "KI"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "KI"},
        ],
        [
            {color: Color.White, kind: "GI"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "GI"},
        ],
        [
            {color: Color.White, kind: "KE"},
            {color: Color.White, kind: "HI"},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {color: Color.Black, kind: "KA"},
            {color: Color.Black, kind: "KE"},
        ],
        [
            {color: Color.White, kind: "KY"},
            {},
            {color: Color.White, kind: "FU"},
            {},
            {},
            {},
            {color: Color.Black, kind: "FU"},
            {},
            {color: Color.Black, kind: "KY"},
        ],
    ];
    const diff = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (!samePiece(obj.initial.data.board[i][j], hirate[i][j])) {
                diff.push("" + (i + 1) + (j + 1));
            }
        }
    }

    const presets = {};
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
    presets["11212231818291"] = "7_L";
    presets["11212271818291"] = "7_R";
    presets["1121223171818291"] = "8";
    presets["11212231416171818291"] = "10";

    const preset = presets[diff.sort().join("")];
    if (preset === "HIRATE") {
        if (obj.initial.data.color === Color.Black) {
            obj.initial.preset = "HIRATE";
            delete obj.initial.data;
        }
    } else if (preset && obj.initial.data.color === Color.White) {
        obj.initial.preset = preset;
        delete obj.initial.data;
    }
}
function samePiece(p1, p2) {
    return (
        (typeof p1.color === "undefined" && typeof p2.color === "undefined") ||
        (typeof p1.color !== "undefined" &&
            typeof p2.color !== "undefined" &&
            p1.color === p2.color &&
            p1.kind === p2.kind)
    );
}
function restoreColorOfIllegalAction(moves: IMoveFormat[], shogi: Shogi) {
    if (moves.length >= 1 && moves[moves.length - 1].special === "ILLEGAL_ACTION") {
        moves[moves.length - 1].special = (shogi.turn ? "+" : "-") + "ILLEGAL_ACTION";
    }
}
function restoreTotalTime(
    time: {now: ITimeFormat; total: ITimeFormat},
    lastTime: {now: ITimeFormat; total: ITimeFormat} = {
        now: {m: 0, s: 0},
        total: {h: 0, m: 0, s: 0},
    }
) {
    if (!time) {
        return;
    }
    time.total = {
        h: (time.now.h || 0) + lastTime.total.h,
        m: time.now.m + lastTime.total.m,
        s: time.now.s + lastTime.total.s,
    };
    time.total.m += Math.floor(time.total.s / 60);
    time.total.s = time.total.s % 60;
    time.total.h += Math.floor(time.total.m / 60);
    time.total.m = time.total.m % 60;
}
