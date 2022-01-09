import {boardBitMapToXYs, sortMoves} from "../../test/utils";
import {Color, Shogi} from "../shogi";

let shogi;
beforeEach(() => {
    shogi = new Shogi();
});
describe("initialize", () => {
    it("normal", () => {
        shogi.initialize();
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("komaochi", () => {
        shogi.initialize({preset: "6"});
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("other, multiple initialize", () => {
        shogi.initialize({
            data: {
                board: [
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{color: Color.White, kind: "OU"}, {}, {color: Color.Black, kind: "FU"}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                ],
                color: Color.Black,
                hands: [
                    {KI: 1},
                    {},
                ],
            },
            preset: "OTHER",
        });
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.initialize({
            data: {
                board: [
                    [{}, {}, {}, {}, {}, {color: Color.White, kind: "KE"}, {
                        color: Color.White,
                        kind: "KE",
                    }, {}, {color: Color.Black, kind: "OU"}],
                    [{}, {}, {}, {}, {}, {color: Color.White, kind: "KE"}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                ],
                color: Color.White,
                hands: [
                    {},
                    {KE: 1},
                ],
            },
            preset: "OTHER",
        });
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
});
describe("initializeFromSFENString", () => {
    it("example 1", () => {
        shogi.initializeFromSFENString("lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1");
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("example 2", () => {
        shogi.initializeFromSFENString(
                "8l/1l+R2P3/p2pBG1pp/kps1p4/Nn1P2G2/P1P1P2PP/1PS6/1KSG3+r1/LN2+p3L w Sbgn3p 124");
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
});
describe("editMode", () => {
    it("example 1", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(8, 2, 2, 2);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();

        shogi.initialize();
        shogi.editMode(true);
        shogi.captureByColor(8, 8, 0);
        shogi.captureByColor(2, 2, 1);
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 2, 2, 2);
        shogi.setTurn(0);
        shogi.editMode(false);

        expect(shogi.toCSAString()).toBe(csa);
    });
    it("example 2", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();

        shogi.initialize();
        shogi.editMode(true);
        shogi.captureByColor(8, 8, 0);
        shogi.flip(2, 2);
        shogi.flip(2, 2);
        shogi.flip(2, 2);
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.setTurn(1);
        shogi.editMode(false);
        expect(shogi.toCSAString()).toBe(csa);
    });
});
describe("move", () => {
    it("normal, promote", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("errors", () => {
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(() => shogi.move(7, 6, 7, 5)).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
        expect(() => shogi.move(7, 7, 7, 8)).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("editMode", () => {
        shogi.editMode(true);
        shogi.move(7, 7, 7, 8);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("force promote at dead end", () => {
        shogi.editMode(true);
        shogi.move(7, 7, 7, 2);
        shogi.move(8, 1, 7, 7);
        shogi.move(1, 9, 6, 2);
        shogi.move(2, 1, 7, 6);
        shogi.editMode(false);
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.move(7, 2, 7, 1);
        shogi.move(7, 7, 8, 9);
        shogi.move(6, 2, 6, 1);
        shogi.move(7, 6, 6, 8);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
});
describe("unmove", () => {
    it("normal", () => {
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.move(7, 7, 7, 6);
        shogi.unmove(7, 7, 7, 6);
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("promote", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.move(8, 8, 3, 3, true);
        shogi.unmove(8, 8, 3, 3, true);
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("capture", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.move(8, 8, 2, 2, true);
        shogi.unmove(8, 8, 2, 2, true, "KA");
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("capture promoted", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.move(3, 1, 2, 2);
        shogi.unmove(3, 1, 2, 2, false, "UM");
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("error", () => {
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(() => shogi.unmove(7, 7, 7, 6)).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("promoteが間違ってtrueになっていても許容する", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.move(3, 1, 2, 2);
        shogi.unmove(3, 1, 2, 2, true, "UM");
        expect(shogi.toCSAString()).toBe(csa);
    });
    describe("private prevTurn", () => {
        it("editMode", () => {
            shogi.editMode(true);
            const csa = shogi.toCSAString();
            expect(shogi.toCSAString()).toMatchSnapshot();
            shogi.move(7, 7, 7, 6);
            shogi.unmove(7, 7, 7, 6);
            expect(shogi.toCSAString()).toBe(csa);
        });
    });
});
describe("drop", () => {
    it("normal", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        shogi.drop(4, 5, "KA");
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("errors", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(() => shogi.drop(4, 5, "KA", Color.White)).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
        expect(() => shogi.drop(3, 4, "KA")).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("editMode", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        shogi.editMode(true);
        shogi.drop(4, 5, "KA");
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.drop(5, 5, "KA", Color.White);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    describe("private popFromHand", () => {
        it("error", () => {
            expect(shogi.toCSAString()).toMatchSnapshot();
            expect(() => shogi.drop(5, 5, "FU")).toThrow();
            expect(shogi.toCSAString()).toMatchSnapshot();
        });
        it("multiple hand", () => {
            shogi.move(7, 7, 7, 6);
            shogi.move(4, 3, 4, 4);
            shogi.move(8, 8, 4, 4);
            shogi.move(8, 2, 4, 2);
            shogi.move(4, 4, 5, 3, true);
            shogi.move(3, 3, 3, 4);
            shogi.move(5, 3, 4, 2);
            shogi.move(3, 1, 4, 2);
            expect(() => {
                shogi.drop(9, 8, "HI");
            }).not.toThrowError();
        });
    });
});
describe("undrop", () => {
    it("normal", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.drop(4, 5, "KA");
        shogi.undrop(4, 5);
        expect(shogi.toCSAString()).toBe(csa);
    });
    it("errors", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        shogi.drop(4, 5, "KA");
        const csa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(() => shogi.undrop(5, 5)).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
        expect(() => shogi.undrop(3, 4)).toThrow();
        expect(shogi.toCSAString()).toBe(csa);
    });
});
describe("toCSAString", () => {
    // TODO: add
});
describe("toSFENString", () => {
    it("normal", () => {
        expect(shogi.toSFENString()).toMatchSnapshot();
    });
    it("color", () => {
        shogi.initialize({preset: "KY"});
        expect(shogi.toSFENString()).toMatchSnapshot();
    });
    it("hands", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        expect(shogi.toSFENString(5)).toMatchSnapshot();
        shogi.move(7, 6, 7, 5);
        shogi.move(7, 3, 7, 4);
        shogi.move(7, 5, 7, 4);
        shogi.move(8, 1, 7, 3);
        shogi.move(7, 4, 7, 3, true);
        shogi.move(8, 2, 7, 2);
        shogi.move(7, 3, 8, 3);
        expect(shogi.toSFENString(12)).toMatchSnapshot();
        shogi.move(7, 2, 7, 9, true);
        expect(shogi.toSFENString(13)).toMatchSnapshot();
    });
});
describe("getMovesFrom", () => {
    it("just", () => {
        expect(shogi.getMovesFrom(7, 7)).toEqual([{from: {x: 7, y: 7}, to: {x: 7, y: 6}}]);
        expect(sortMoves(shogi.getMovesFrom(5, 9))).toEqual(sortMoves([
            {from: {x: 5, y: 9}, to: {x: 4, y: 8}},
            {from: {x: 5, y: 9}, to: {x: 5, y: 8}},
            {from: {x: 5, y: 9}, to: {x: 6, y: 8}},
        ]));
        expect(sortMoves(shogi.getMovesFrom(4, 9))).toEqual(sortMoves([
            {from: {x: 4, y: 9}, to: {x: 3, y: 8}},
            {from: {x: 4, y: 9}, to: {x: 4, y: 8}},
            {from: {x: 4, y: 9}, to: {x: 5, y: 8}},
        ]));
        expect(shogi.getMovesFrom(8, 9)).toEqual([]);
    });
    it("fly", () => {
        expect(shogi.getMovesFrom(1, 1)).toEqual([{from: {x: 1, y: 1}, to: {x: 1, y: 2}}]);
        expect(sortMoves(shogi.getMovesFrom(2, 8))).toEqual(sortMoves([
            {from: {x: 2, y: 8}, to: {x: 1, y: 8}},
            {from: {x: 2, y: 8}, to: {x: 3, y: 8}},
            {from: {x: 2, y: 8}, to: {x: 4, y: 8}},
            {from: {x: 2, y: 8}, to: {x: 5, y: 8}},
            {from: {x: 2, y: 8}, to: {x: 6, y: 8}},
            {from: {x: 2, y: 8}, to: {x: 7, y: 8}},
        ]));
    });
    it("just & fly", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        expect(sortMoves(shogi.getMovesFrom(2, 2))).toEqual(sortMoves([
            {from: {x: 2, y: 2}, to: {x: 1, y: 1}},
            {from: {x: 2, y: 2}, to: {x: 1, y: 2}},
            {from: {x: 2, y: 2}, to: {x: 1, y: 3}},
            {from: {x: 2, y: 2}, to: {x: 2, y: 1}},
            {from: {x: 2, y: 2}, to: {x: 2, y: 3}},
            {from: {x: 2, y: 2}, to: {x: 3, y: 1}},
            {from: {x: 2, y: 2}, to: {x: 3, y: 2}},
            {from: {x: 2, y: 2}, to: {x: 3, y: 3}},
            {from: {x: 2, y: 2}, to: {x: 4, y: 4}},
            {from: {x: 2, y: 2}, to: {x: 5, y: 5}},
            {from: {x: 2, y: 2}, to: {x: 6, y: 6}},
            {from: {x: 2, y: 2}, to: {x: 7, y: 7}},
            {from: {x: 2, y: 2}, to: {x: 8, y: 8}},
        ]));
    });
    it("empty", () => {
        expect(shogi.getMovesFrom(7, 6)).toEqual([]);
    });
    it("初期局面の移動可能手", () => {
        let movable = 0;
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                const move = shogi.getMovesFrom(i, j);
                movable += move.length;
            }
        }
        expect(movable).toBe(60);
    });
    describe("MOVE_DEF", () => {
        it("RY", () => {
            shogi.move(7, 7, 7, 6);
            shogi.move(4, 3, 4, 4);
            shogi.move(8, 8, 4, 4);
            shogi.move(8, 2, 4, 2);
            shogi.move(4, 4, 5, 3, true);
            shogi.move(4, 2, 4, 7, true);
            expect(sortMoves(shogi.getMovesFrom(4, 7))).toEqual(sortMoves([
                {from: {x: 4, y: 7}, to: {x: 4, y: 2}},
                {from: {x: 4, y: 7}, to: {x: 4, y: 3}},
                {from: {x: 4, y: 7}, to: {x: 4, y: 4}},
                {from: {x: 4, y: 7}, to: {x: 4, y: 5}},
                {from: {x: 4, y: 7}, to: {x: 4, y: 6}},
                {from: {x: 4, y: 7}, to: {x: 4, y: 8}},
                {from: {x: 4, y: 7}, to: {x: 4, y: 9}},
                {from: {x: 4, y: 7}, to: {x: 3, y: 6}},
                {from: {x: 4, y: 7}, to: {x: 3, y: 7}},
                {from: {x: 4, y: 7}, to: {x: 3, y: 8}},
                {from: {x: 4, y: 7}, to: {x: 5, y: 6}},
                {from: {x: 4, y: 7}, to: {x: 5, y: 7}},
                {from: {x: 4, y: 7}, to: {x: 5, y: 8}},
            ]));
        });
    });
});
describe("getDropsBy", () => {
    it("normal", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        expect(sortMoves(shogi.getDropsBy(Color.Black))).toEqual(sortMoves([
            {to: {x: 1, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 1, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 1, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 1, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 1, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 2, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 2, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 2, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 3, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 3, y: 3}, color: Color.Black, kind: "KA"},
            {to: {x: 3, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 3, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 3, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 4, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 4, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 4, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 4, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 4, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 5, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 5, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 5, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 5, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 5, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 6, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 6, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 6, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 6, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 6, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 7, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 7, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 7, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 7, y: 7}, color: Color.Black, kind: "KA"},
            {to: {x: 7, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 8, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 8, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 8, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 8, y: 8}, color: Color.Black, kind: "KA"},
            {to: {x: 9, y: 2}, color: Color.Black, kind: "KA"},
            {to: {x: 9, y: 4}, color: Color.Black, kind: "KA"},
            {to: {x: 9, y: 5}, color: Color.Black, kind: "KA"},
            {to: {x: 9, y: 6}, color: Color.Black, kind: "KA"},
            {to: {x: 9, y: 8}, color: Color.Black, kind: "KA"},
        ]));
        expect(shogi.getDropsBy(Color.White)).toEqual([]);
    });
    it("same pieces in hand", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        shogi.drop(3, 3, "KA");
        shogi.move(2, 2, 3, 3);
        expect(sortMoves(shogi.getDropsBy(Color.White))).toEqual(sortMoves([
            {to: {x: 1, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 1, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 1, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 1, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 1, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 2, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 2, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 2, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 2, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 3, y: 1}, color: Color.White, kind: "KA"},
            {to: {x: 3, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 3, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 3, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 3, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 4, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 4, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 4, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 4, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 4, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 5, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 5, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 5, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 5, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 5, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 6, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 6, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 6, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 6, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 6, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 7, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 7, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 7, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 7, y: 7}, color: Color.White, kind: "KA"},
            {to: {x: 7, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 8, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 8, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 8, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 8, y: 8}, color: Color.White, kind: "KA"},
            {to: {x: 9, y: 2}, color: Color.White, kind: "KA"},
            {to: {x: 9, y: 4}, color: Color.White, kind: "KA"},
            {to: {x: 9, y: 5}, color: Color.White, kind: "KA"},
            {to: {x: 9, y: 6}, color: Color.White, kind: "KA"},
            {to: {x: 9, y: 8}, color: Color.White, kind: "KA"},
        ]));
    });
    it("nifu", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(4, 3, 4, 4);
        shogi.move(8, 8, 4, 4);
        expect(sortMoves(shogi.getDropsBy(Color.Black))).toEqual([]);
        expect(shogi.getDropsBy(Color.White)).toEqual([]);
        shogi.move(8, 2, 4, 2);
        shogi.move(4, 4, 5, 3, true);
        shogi.move(4, 2, 4, 7, true);
        expect(sortMoves(shogi.getDropsBy(Color.Black)))
            .toEqual(sortMoves(boardBitMapToXYs(
                "_________\n" +
                "_____o___\n" +
                "_____o___\n" +
                "_____o___\n" +
                "_____o___\n" +
                "_____o___\n" +
                "_________\n" +
                "_____o___\n" +
                "_________",
            ).o.map((to) => ({to, color: Color.Black, kind: "FU"}))));
        expect(sortMoves(shogi.getDropsBy(Color.White)))
            .toEqual(sortMoves(boardBitMapToXYs(
                "_________\n" +
                "____oo___\n" +
                "_____o___\n" +
                "____oo___\n" +
                "____oo___\n" +
                "____oo___\n" +
                "_________\n" +
                "____oo___\n" +
                "_________",
            ).o.map((to) => ({to, color: Color.White, kind: "FU"}))));
    });
    it("piece which can only move to out of board: KE", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 9, 7, 7);
        shogi.move(2, 2, 7, 7, true);
        shogi.move(7, 9, 6, 8);
        expect(sortMoves(shogi.getDropsBy(Color.White)))
            .toEqual(sortMoves(boardBitMapToXYs(
                "_________\n" +
                "o_ooooooo\n" +
                "______o__\n" +
                "oooooo_oo\n" +
                "ooooooooo\n" +
                "oo_oooooo\n" +
                "_________\n" +
                "_________\n" +
                "_________",
            ).o.map((to) => ({to, color: Color.White, kind: "KE"}))));
    });
    it("piece which can only move to out of board: KY", () => {
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(5, 1, 6, 2);
        shogi.move(2, 2, 1, 1);
        shogi.move(6, 1, 7, 2);
        shogi.drop(7, 7, "KA", Color.Black);
        expect(sortMoves(shogi.getDropsBy(Color.Black)))
            .toEqual(sortMoves(boardBitMapToXYs(
                "_________\n" +
                "o___ooooo\n" +
                "______o__\n" +
                "oooooo_oo\n" +
                "ooooooooo\n" +
                "oo_oooooo\n" +
                "_________\n" +
                "ooooooo_o\n" +
                "_________",
            ).o.map((to) => ({to, color: Color.Black, kind: "KY"}))));
    });
});
describe("getMovesTo", () => {
    it("just", () => {
        expect(shogi.getMovesTo(7, 6, "FU")).toEqual([{from: {x: 7, y: 7}, to: {x: 7, y: 6}}]);
    });
    it("fly", () => {
        shogi.move(7, 7, 7, 6);
        expect(shogi.getMovesTo(1, 2, "KY")).toEqual([{from: {x: 1, y: 1}, to: {x: 1, y: 2}}]);
    });
    it("color parameter", () => {
        expect(shogi.getMovesTo(1, 2, "KY", Color.Black)).toEqual([]);
        expect(shogi.getMovesTo(1, 2, "KY", Color.White)).toEqual([{from: {x: 1, y: 1}, to: {x: 1, y: 2}}]);
    });
});
describe("getHandsSummary", () => {
    it("normal", () => {
        expect(shogi.getHandsSummary(Color.Black)).toEqual({
            FU: 0,
            KY: 0,
            KE: 0,
            GI: 0,
            KI: 0,
            KA: 0,
            HI: 0,
        });
        shogi.move(7, 7, 7, 6);
        shogi.move(3, 3, 3, 4);
        shogi.move(8, 8, 2, 2, true);
        shogi.move(3, 1, 2, 2);
        expect(shogi.getHandsSummary(Color.Black)).toEqual({
            FU: 0,
            KY: 0,
            KE: 0,
            GI: 0,
            KI: 0,
            KA: 1,
            HI: 0,
        });
        shogi.drop(3, 3, "KA");
        shogi.move(2, 2, 3, 3);
        expect(shogi.getHandsSummary(Color.White)).toEqual({
            FU: 0,
            KY: 0,
            KE: 0,
            GI: 0,
            KI: 0,
            KA: 2,
            HI: 0,
        });
    });
});
describe("captureByColor", () => {
    it("normal", () => {
        shogi.editMode(true);
        shogi.captureByColor(7, 7, Color.Black);
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.captureByColor(8, 8, Color.White);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("error", () => {
        expect(() => shogi.captureByColor(7, 7, Color.Black)).toThrow();
    });
});
describe("flip", () => {
    it("normal", () => {
        shogi.editMode(true);
        expect(shogi.flip(7, 7)).toBe(true);
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(shogi.flip(7, 7)).toBe(true);
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(shogi.flip(7, 7)).toBe(true);
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(shogi.flip(7, 7)).toBe(true);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("kin", () => {
        shogi.editMode(true);
        expect(shogi.flip(6, 9)).toBe(true);
        expect(shogi.toCSAString()).toMatchSnapshot();
        expect(shogi.flip(6, 9)).toBe(true);
        expect(shogi.toCSAString()).toMatchSnapshot();
    });
    it("fail", () => {
        shogi.editMode(true);
        expect(shogi.flip(7, 6)).toBe(false);
    });
    it("error", () => {
        expect(() => shogi.flip(7, 7)).toThrow();
    });
});
describe("setTurn", () => {
    it("normal", () => {
        const firstCsa = shogi.toCSAString();
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.editMode(true);
        shogi.setTurn(Color.White);
        expect(shogi.toCSAString()).toMatchSnapshot();
        shogi.setTurn(Color.Black);
        expect(shogi.toCSAString()).toBe(firstCsa);
    });
    it("error", () => {
        expect(() => shogi.setTurn(Color.White)).toThrow();
    });
});
