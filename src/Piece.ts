import Color from "./Color";
import {Kind} from "./Kind";

/**
 * 駒を表すクラス
 */
export default class Piece {
    /**
     * 成った時の種類を返す．なければそのまま．
     */
    public static promote(kind: Kind): Kind {
        return {
            FU: "TO",
            KY: "NY",
            KE: "NK",
            GI: "NG",
            KA: "UM",
            HI: "RY",
        }[kind] || kind;
    }
    /**
     * 表に返した時の種類を返す．表の場合はそのまま．
     */
    public static unpromote(kind: Kind): Kind {
        return {
            TO: "FU",
            NY: "KY",
            NK: "KE",
            NG: "GI",
            KI: "KI",
            UM: "KA",
            RY: "HI",
            OU: "OU",
        }[kind] || kind;
    }
    /**
     * 成れる駒かどうかを返す
     */
    public static canPromote(kind: Kind): boolean {
        return Piece.promote(kind) !== kind;
    }
    public static isPromoted(kind: Kind): boolean {
        return ["TO", "NY", "NK", "NG", "UM", "RY"].indexOf(kind) >= 0;
    }
    public static oppositeColor(color: Color): Color {
        return color === Color.Black ? Color.White : Color.Black;
    }
    /**
     * SFENによる文字列表現から駒オブジェクトを作成
     */
    public static fromSFENString(sfen: string): Piece {
        const promoted = sfen[0] === "+";
        if (promoted) {
            sfen = sfen.slice(1);
        }
        const color = sfen.match(/[A-Z]/) ? "+" : "-";
        const kind = {
            P: "FU",
            L: "KY",
            N: "KE",
            S: "GI",
            G: "KI",
            B: "KA",
            R: "HI",
            K: "OU",
        }[sfen.toUpperCase()];
        const piece = new Piece(color + kind);
        if (promoted) {
            piece.promote();
        }
        return piece;
    }

    /**
     * 先後
     */
    public color: Color;
    /**
     * 駒の種類
     */
    public kind: Kind;
    /**
     * "+FU"などのCSAによる駒表現から駒オブジェクトを作成
     */
    constructor(csa: string) {
        this.color = csa.slice(0, 1) === "+" ? Color.Black : Color.White;
        this.kind = csa.slice(1) as Kind;
    }
    /**
     * 成る
     */
    public promote(): void {
        this.kind = Piece.promote(this.kind);
    }
    /**
     * 不成にする
     */
    public unpromote(): void {
        this.kind = Piece.unpromote(this.kind);
    }
    /**
     * 駒の向きを反転する
     */
    public inverse(): void {
        this.color = this.color === Color.Black ? Color.White : Color.Black;
    }
    /**
     * CSAによる駒表現の文字列を返す
     */
    public toCSAString(): string {
        return (this.color === Color.Black ? "+" : "-") + this.kind;
    }
    /**
     * SFENによる駒表現の文字列を返す
     */
    public toSFENString(): string {
        const sfenPiece = {
            FU: "P", // Pawn
            KY: "L", // Lance
            KE: "N", // kNight
            GI: "S", // Silver
            KI: "G", // Gold
            KA: "B", // Bishop
            HI: "R", // Rook
            OU: "K", // King
        }[Piece.unpromote(this.kind)];
        return (Piece.isPromoted(this.kind) ? "+" : "") +
            (this.color === Color.Black ? sfenPiece : sfenPiece.toLowerCase());
    }
}
