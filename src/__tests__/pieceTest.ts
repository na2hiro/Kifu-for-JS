import Piece from "../Piece";

describe("promote", () => {
    it("can be done", () => {
        const fu = new Piece("+FU");
        fu.promote();
        expect(new Piece("+TO")).toEqual(fu);
    });
    it("is idempotent", () => {
        const fu = new Piece("+FU");
        fu.promote();
        expect(new Piece("+TO")).toEqual(fu);
        fu.promote();
        expect(new Piece("+TO")).toEqual(fu);
    });
});
describe("unpromote", () => {
    it("can unpromote, and unpromote is idempotent", () => {
        const ky = new Piece("+KY");
        ky.promote();
        ky.unpromote();
        expect(new Piece("+KY")).toEqual(ky);
    });
    it("is idempotent", () => {
        const ny = new Piece("+NY");
        ny.unpromote();
        expect(new Piece("+KY")).toEqual(ny);
        ny.unpromote();
        expect(new Piece("+KY")).toEqual(ny);
    });
});
describe("inverse", () => {
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
