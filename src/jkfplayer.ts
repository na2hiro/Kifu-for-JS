/* eslint-disable no-empty */
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

import {Color, Piece, Shogi} from "shogi.js";
import {IJSONKifuFormat, IMoveFormat, IMoveMoveFormat, IStateFormat} from "./Formats";
import {canPromote, normalizeCSA, normalizeKI2, normalizeKIF, normalizeMinimal} from "./normalizer";
import {parseCSA, parseKI2, parseKIF} from "./peg/parsers";

export default class JKFPlayer {
    public static debug = false;
    public static logs = [];
    public static log(...lg: unknown[]) {
        if (JKFPlayer.debug) {
            console.log(lg);
        } else {
            JKFPlayer.logs.push(lg);
        }
    }
    public static parse(kifu: string, filename?: string) {
        if (filename) {
            const tmp = filename.split(".");
            const ext = tmp[tmp.length - 1].toLowerCase();
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
        } catch (e) {
            JKFPlayer.log("failed to parse as jkf", e);
        }
        try {
            return JKFPlayer.parseKIF(kifu);
        } catch (e) {
            JKFPlayer.log("failed to parse as kif", e);
        }
        try {
            return JKFPlayer.parseKI2(kifu);
        } catch (e) {
            JKFPlayer.log("failed to parse as ki2", e);
        }
        try {
            return JKFPlayer.parseCSA(kifu);
        } catch (e) {
            JKFPlayer.log("failed to parse as csa", e);
        }
        throw new Error("JKF, KIF, KI2, CSAいずれの形式でも失敗しました");
    }
    public static parseJKF(kifu: string) {
        JKFPlayer.log("parseJKF", kifu);
        return new JKFPlayer(JSON.parse(kifu));
    }
    public static parseKIF(kifu: string) {
        JKFPlayer.log("parseKIF", kifu);
        return new JKFPlayer(normalizeKIF(parseKIF(JKFPlayer.addLastNewLine(kifu))));
    }
    public static parseKI2(kifu: string) {
        JKFPlayer.log("parseKI2", kifu);
        return new JKFPlayer(normalizeKI2(parseKI2(JKFPlayer.addLastNewLine(kifu))));
    }
    public static parseCSA(kifu: string) {
        JKFPlayer.log("parseCSA", kifu);
        return new JKFPlayer(normalizeCSA(parseCSA(JKFPlayer.addLastNewLine(kifu))));
    }
    public static addLastNewLine(kifu: string) {
        if (kifu.substr(kifu.length - 1) === "\n") {
            return kifu;
        }
        return kifu + "\n";
    }
    public static numToZen(n: number) {
        return "０１２３４５６７８９"[n];
    }
    public static numToKan(n: number) {
        return "〇一二三四五六七八九"[n];
    }
    public static kindToKan(kind: string): string {
        return {
            FU: "歩",
            KY: "香",
            KE: "桂",
            GI: "銀",
            KI: "金",
            KA: "角",
            HI: "飛",
            OU: "玉",
            TO: "と",
            NY: "成香",
            NK: "成桂",
            NG: "成銀",
            UM: "馬",
            RY: "龍",
        }[kind];
    }
    public static relativeToKan(relative: string) {
        return {
            L: "左",
            C: "直",
            R: "右",
            U: "上",
            M: "寄",
            D: "引",
            H: "打",
        }[relative];
    }
    public static specialToKan(special: string) {
        return (
            {
                TORYO: "投了",
                CHUDAN: "中断",
                SENNICHITE: "千日手",
                TIME_UP: "時間切れ",
                ILLEGAL_MOVE: "反則負け",
                "+ILLEGAL_ACTION": "後手反則負け",
                "-ILLEGAL_ACTION": "先手反則負け",
                JISHOGI: "持将棋",
                KACHI: "勝ち宣言",
                HIKIWAKE: "引き分け宣言",
                MATTA: "待った",
                TSUMI: "詰",
                FUZUMI: "不詰",
                ERROR: "エラー",
            }[special] || special
        );
    }
    public static moveToReadableKifu(mv: IMoveFormat): string {
        if (mv.special) {
            return JKFPlayer.specialToKan(mv.special);
        }
        const move = mv.move;
        let ret = move.color === Color.Black ? "☗" : "☖";
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
    }
    public static doMove(shogi: Shogi, move: IMoveMoveFormat) {
        if (!move) {
            return;
        }
        if (move.from) {
            shogi.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
        } else {
            shogi.drop(
                move.to.x,
                move.to.y,
                move.piece,
                typeof move.color !== "undefined" ? move.color : void 0
            );
        }
    }
    public static undoMove(shogi: Shogi, move: IMoveMoveFormat) {
        if (!move) {
            return;
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
    }
    public static getState(shogi: Shogi): IStateFormat {
        return {
            board: JKFPlayer.getBoardState(shogi),
            color: shogi.turn,
            hands: JKFPlayer.getHandsState(shogi),
        };
    }

    private static sameMoveMinimal(move1: IMoveMoveFormat, move2: IMoveMoveFormat) {
        return (
            move1.to.x === move2.to.x &&
            move1.to.y === move2.to.y &&
            (move1.from && move2.from
                ? move1.from.x === move2.from.x &&
                  move1.from.y === move2.from.y &&
                  move1.promote === move2.promote
                : move1.piece === move2.piece)
        );
    }
    private static getBoardState(shogi: Shogi) {
        const ret = [];
        for (let i = 1; i <= 9; i++) {
            const arr = [];
            for (let j = 1; j <= 9; j++) {
                const piece = shogi.get(i, j);
                arr.push(piece ? {color: piece.color, kind: piece.kind} : {});
            }
            ret.push(arr);
        }
        return ret;
    }
    private static getHandsState(shogi: Shogi) {
        return [shogi.getHandsSummary(Color.Black), shogi.getHandsSummary(Color.White)];
    }

    public shogi: Shogi;
    public kifu: IJSONKifuFormat;
    public tesuu: number;
    public forkPointers: Array<{te: number; forkIndex: number}> = [];
    private forks_ = null;
    private currentStream_: IMoveFormat[] = null;
    get forks(): Array<{te: number; moves: IMoveFormat[]}> {
        if (this.forks_ === null) {
            this.updateForksAndCurrentStream();
        }
        return this.forks_;
    }
    get currentStream(): IMoveFormat[] {
        if (this.currentStream_ === null) {
            this.updateForksAndCurrentStream();
        }
        return this.currentStream_;
    }

    constructor(kifu: IJSONKifuFormat) {
        this.shogi = new Shogi(kifu.initial || undefined);
        this.initialize(kifu);
    }
    public initialize(kifu: IJSONKifuFormat) {
        this.kifu = kifu;
        this.tesuu = 0;
        this.forkPointers = [];
    }
    // 1手進める
    public forward() {
        const nextMove = this.getMoveFormat(this.tesuu + 1);
        if (!nextMove) {
            return false;
        }
        this.tesuu++;
        const move = nextMove.move;
        if (!move) {
            return true;
        }
        JKFPlayer.log("forward", this.tesuu, move);
        this.doMove(move);
        return true;
    }
    // 1手戻す
    public backward() {
        if (this.tesuu <= 0) {
            return false;
        }
        const move = this.getMoveFormat(this.tesuu).move;
        JKFPlayer.log("backward", this.tesuu - 1, move);
        this.undoMove(move);
        this.tesuu--;
        this.forkPointers = this.forkPointers.filter((fork) => fork.te <= this.tesuu);
        this.updateForksAndCurrentStream();
        return true;
    }
    // tesuu手目へ行く
    public goto(tesuu: number | string) {
        if (typeof tesuu === "string") {
            const commaPos = tesuu.indexOf(",");
            if (commaPos > 0) {
                // Specify tesuu pointer
                const te = Number(tesuu.slice(0, commaPos));
                const destPointers = JSON.parse(tesuu.slice(commaPos + 1));
                let matchingSoFar = true;
                for (let i = 0; i < destPointers.length; i++) {
                    const dest = destPointers[i];
                    const current = this.forkPointers[i];
                    if (
                        matchingSoFar &&
                        current &&
                        current.te === dest.te &&
                        current.forkIndex === dest.forkIndex
                    ) {
                        // We don't need to repeat the same forking as currently while it's matching
                        continue;
                    }
                    matchingSoFar = false;
                    this.goto(dest.te - 1);
                    this.forkAndForward(dest.forkIndex);
                }
                // Rewind if current fork is deeper than the destination
                if (matchingSoFar && destPointers.length < this.forkPointers.length) {
                    this.goto(this.forkPointers[destPointers.length].te - 1);
                }
                this.goto(te);
                return;
            }
            tesuu = Number(tesuu);
        }
        if (isNaN(tesuu)) {
            return;
        }
        let limit = 10000; // for safe
        if (this.tesuu < tesuu) {
            while (this.tesuu !== tesuu && this.forward() && limit-- > 0) {}
        } else {
            while (this.tesuu !== tesuu && this.backward() && limit-- > 0) {}
        }
        if (limit === 0) {
            throw new Error("tesuu overflows");
        }
    }
    // tesuu手前後に移動する
    public go(tesuu: number | string) {
        if (typeof tesuu === "string") {
            tesuu = Number(tesuu);
        }
        if (isNaN(tesuu)) {
            return;
        }
        this.goto(this.tesuu + tesuu);
    }
    // 現在の局面から別れた分岐のうちnum番目の変化へ1つ進む
    public forkAndForward(num: number | string): boolean {
        if (typeof num === "string") {
            num = parseInt(num, 10);
        }
        const forks = this.getMoveFormat(this.tesuu + 1).forks;
        if (!forks || forks.length <= num) {
            return false;
        }
        this.forkPointers.push({te: this.tesuu + 1, forkIndex: num});
        this.updateForksAndCurrentStream();
        return this.forward();
    }

    /**
     * Return a tesuu pointer string which can be used to call goto()
     */
    public getTesuuPointer(tesuu?: number): string {
        if (isNaN(tesuu)) {
            tesuu = this.tesuu;
        }
        return `${tesuu},${JSON.stringify(this.forkPointers.filter((p) => p.te <= tesuu))}`;
    }
    // TODO: Distinguish minimal move and full move
    // 現在の局面から新しいかもしれない手を1手動かす．
    // 必要フィールドは，指し: from, to, promote(成れる場合のみ)．打ち: to, piece
    // 新しい手の場合，最終手であれば手を追加，そうでなければ分岐を追加
    // もしpromoteの可能性があればfalseを返して何もしない
    // 成功すればその局面に移動してtrueを返す．
    public inputMove(move: IMoveMoveFormat) {
        if (this.getMoveFormat().special) {
            throw new Error("終了局面へ棋譜を追加することは出来ません");
        }
        if (move.from != null && move.promote == null) {
            const piece = this.shogi.get(move.from.x, move.from.y);
            if (
                !Piece.isPromoted(piece.kind) &&
                Piece.canPromote(piece.kind) &&
                (canPromote(move.from, piece.color) || canPromote(move.to, piece.color))
            ) {
                return false;
            }
        }
        const nextMove = this.getMoveFormat(this.tesuu + 1);
        if (nextMove) {
            if (nextMove.move && JKFPlayer.sameMoveMinimal(nextMove.move, move)) {
                // 次の一手と一致
                this.forward();
                return true;
            }
            if (nextMove.forks) {
                for (let i = 0; i < nextMove.forks.length; i++) {
                    const forkCand = nextMove.forks[i][0];
                    if (
                        forkCand &&
                        forkCand.move &&
                        JKFPlayer.sameMoveMinimal(forkCand.move, move)
                    ) {
                        // 分岐と一致
                        this.forkAndForward(i);
                        return true;
                    }
                }
            }
        }
        this.doMove(move); // 動かしてみる(throwされうる)
        const newMove = {move};
        const addToFork = this.tesuu < this.getMaxTesuu();
        let next;
        if (addToFork) {
            // 最終手でなければ分岐に追加
            next = this.getMoveFormat(this.tesuu + 1);
            if (!next.forks) {
                next.forks = [];
            }
            next.forks.push([newMove]);
        } else {
            // 最終手に追加
            this.forks[this.forks.length - 1].moves.push(newMove);
        }
        this.updateForksAndCurrentStream();
        normalizeMinimal(this.kifu); // 復元
        this.undoMove(move);
        // 考え改めて再生
        if (addToFork) {
            this.forkAndForward(next.forks.length - 1);
        } else {
            this.forward();
        }
        return true;
    }
    // wrapper
    public getBoard(x: number, y: number): Piece {
        return this.shogi.get(x, y);
    }
    public getComments(tesuu: number = this.tesuu) {
        return this.getMoveFormat(tesuu).comments || [];
    }
    public getMove(tesuu: number = this.tesuu) {
        return this.getMoveFormat(tesuu).move;
    }
    public getReadableKifu(tesuu: number = this.tesuu): string {
        if (tesuu === 0) {
            return "開始局面";
        }
        return JKFPlayer.moveToReadableKifu(this.getMoveFormat(tesuu));
    }
    public getReadableForkKifu(tesuu: number = this.tesuu): string[] {
        return this.getNextFork(tesuu).map((fork) => JKFPlayer.moveToReadableKifu(fork[0]));
    }
    public getMaxTesuu() {
        return this.currentStream.length - 1;
    }
    public toJKF() {
        return JSON.stringify(this.kifu);
    }
    // jkf.initial.dataの形式を得る
    public getState() {
        return JKFPlayer.getState(this.shogi);
    }
    public getReadableKifuState(): Array<{kifu: string; forks: string[]; comments: string[]}> {
        const ret = [];
        for (let i = 0; i <= this.getMaxTesuu(); i++) {
            ret.push({
                comments: this.getComments(i),
                forks: this.getReadableForkKifu(i - 1),
                kifu: this.getReadableKifu(i),
            });
        }
        return ret;
    }

    private updateForksAndCurrentStream() {
        const forks: Array<{te: number; moves: IMoveFormat[]}> = [];
        let currentStream: IMoveFormat[] = [];
        let currentFork: IMoveFormat[] = this.kifu.moves;
        let tesuuOffset = 0;
        for (const pointer of this.forkPointers) {
            forks.push({te: tesuuOffset, moves: currentFork});
            currentStream = currentStream.concat(currentFork.slice(0, pointer.te - tesuuOffset));
            currentFork = currentFork[pointer.te - tesuuOffset].forks[pointer.forkIndex];
            tesuuOffset = pointer.te;
        }
        forks.push({te: tesuuOffset, moves: currentFork});
        this.forks_ = forks;
        this.currentStream_ = currentStream.concat(currentFork.slice());
    }

    // 現在の局面から分岐を遡った初手から，現在の局面からの本譜の中から棋譜を得る
    private getMoveFormat(tesuu: number = this.tesuu): IMoveFormat {
        return this.currentStream[tesuu];
    }
    private getNextFork(tesuu: number = this.tesuu) {
        const next = this.getMoveFormat(tesuu + 1);
        return next && next.forks ? next.forks : [];
    }
    private doMove(move: IMoveMoveFormat) {
        JKFPlayer.doMove(this.shogi, move);
    }
    private undoMove(move: IMoveMoveFormat) {
        JKFPlayer.undoMove(this.shogi, move);
    }
}
