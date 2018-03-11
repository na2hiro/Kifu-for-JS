import "jest";
import Piece from "../Piece";

function sortMove(moves) {
    return moves.sort((a, b) => toNum(a) - toNum(b));

    function toNum(move) {
        return move.from
            ? move.from.x * 9 * 9 * 9 + move.from.y * 9 * 9 + move.to.x * 9 + move.to.y
            : -kindToNum(move.kind) * 9 * 9 * 2 + move.color * 9 * 9 + move.to.x * 9 + move.to.y;
    }

    function kindToNum(kind) {
        return ["FU", "KY", "KE", "GI", "KI", "KA", "HI", "OU"];
    }
}

describe("promote", () => {
    it("normal", () => {
        const fu = new Piece("+FU");
        fu.promote();
        expect(new Piece("+TO")).toEqual(fu);
        fu.promote();
        expect(new Piece("+TO")).toEqual(fu);
    });
});
describe("unpromote", () => {
    it("normal", () => {
        const ky = new Piece("+KY");
        ky.promote();
        ky.unpromote();
        expect(new Piece("+KY")).toEqual(ky);
        ky.unpromote();
        expect(new Piece("+KY")).toEqual(ky);
    });
});
describe("unpromote", () => {
    it("normal", () => {
        const ke = new Piece("+KE");
        ke.inverse();
        expect(new Piece("-KE")).toEqual(ke);
        ke.inverse();
        expect(new Piece("+KE")).toEqual(ke);
    });
});
describe("toCSAString", () => {
    it("normal", () => {
        const gi = new Piece("+GI");
        expect(gi.toCSAString()).toBe("+GI");
    });
});
describe("toSFENString", () => {
    it("normal", () => {
        expect(new Piece("+GI").toSFENString()).toBe("S");
        expect(new Piece("-GI").toSFENString()).toBe("s");
        expect(new Piece("+TO").toSFENString()).toBe("+P");
        expect(new Piece("-TO").toSFENString()).toBe("+p");
    });
});
describe("static promote", () => {
    it("normal", () => {
        expect(Piece.promote("KA")).toBe("UM");
        expect(Piece.promote("UM")).toBe("UM");
        expect(Piece.promote("KI")).toBe("KI");
    });
});
describe("static unpromote", () => {
    it("normal", () => {
        expect(Piece.unpromote("RY")).toBe("HI");
        expect(Piece.unpromote("HI")).toBe("HI");
        expect(Piece.unpromote("OU")).toBe("OU");
    });
});
describe("static canPromote", () => {
    it("normal", () => {
        expect(Piece.canPromote("KA")).toBe(true);
        expect(Piece.canPromote("UM")).toBe(false);
        expect(Piece.canPromote("KI")).toBe(false);
    });
});
describe("static fromSFENString", () => {
    it("normal", () => {
        expect(Piece.fromSFENString("S").toCSAString()).toBe("+GI");
        expect(Piece.fromSFENString("s").toCSAString()).toBe("-GI");
        expect(Piece.fromSFENString("+P").toCSAString()).toBe("+TO");
        expect(Piece.fromSFENString("+p").toCSAString()).toBe("-TO");
    });
});
