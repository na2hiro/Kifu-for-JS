import "jest";
import {IJSONKifuFormat} from "../Formats";
import {normalizeCSA, normalizeKI2, normalizeKIF, normalizeMinimal} from "../normalizer";
/* tslint:disable:object-literal-sort-keys max-line-length */

function p(x, y) {
    return {x, y};
}
describe("module Normalizer", () => {
    describe("normalizeMinimal", () => {
        let actual;
        let expected;
        beforeEach(() => {
            actual = {
                header: {},
                moves: [{}],
            };
            expected = {
                header: {},
                moves: [{}],
            };
        });
        it("no move", () => {
            expect(normalizeMinimal(actual)).toEqual(expected);
            actual.moves.pop();
            expected.moves.pop();
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("normal", () => {
            actual.moves[1] = {move: {from: p(7, 7), to: p(7, 6)}};
            expected.moves[1] = {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}};
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("same, capture", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6)}},
                {move: {from: p(4, 3), to: p(4, 4)}},
                {move: {from: p(8, 8), to: p(4, 4)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(4, 4), color: 0, piece: "KA", same: true, capture: "FU"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("promote:false, drop", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6)}},
                {move: {from: p(3, 3), to: p(3, 4)}},
                {move: {from: p(8, 8), to: p(2, 2)}},
                {move: {from: p(3, 1), to: p(2, 2)}},
                {move: {piece: "KA", to: p(4, 5)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                {move: {to: p(4, 5), color: 0, piece: "KA"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("hit, with piece", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6)}},
                {move: {from: p(3, 3), to: p(3, 4)}},
                {move: {from: p(8, 9), to: p(7, 7)}},
                {move: {from: p(2, 2), to: p(7, 7), promote: true}},
                {move: {from: p(8, 8), to: p(7, 7)}},
                {move: {piece: "KE", to: p(3, 3)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("fork", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4)}},
                {move: {from: p(8, 9), to: p(7, 7)}, forks: [
                    [
                        {move: {from: p(8, 8), to: p(2, 2)}},
                        {move: {from: p(3, 1), to: p(2, 2)}},
                        {move: {piece: "KA", to: p(4, 5)}},
                    ],
                ]},
                {move: {from: p(2, 2), to: p(7, 7), promote: true}},
                {move: {from: p(8, 8), to: p(7, 7)}},
                {move: {piece: "KE", to: p(3, 3)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}, forks: [
                    [
                        {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                        {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                        {move: {to: p(4, 5), color: 0, piece: "KA"}},
                    ],
                ]},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("error", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6)}},
                {move: {from: p(3, 3), to: p(3, 2)}},
            );
            expect(() => {
                normalizeMinimal(actual);
            }).toThrow();
        });
    });

    describe("normalizeKIF", () => {
        let actual;
        let expected;
        beforeEach(() => {
            actual = {
                header: {},
                moves: [{}],
            };
            expected = {
                header: {},
                moves: [{}],
            };
        });
        it("no move", () => {
            expect(normalizeKIF(actual)).toEqual(expected);
            actual.moves.pop();
            expected.moves.pop();
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("normal", () => {
            actual.moves[1] = {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}};
            expected.moves[1] = {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}};
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("same, capture", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(4, 3), to: p(4, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(4, 4), piece: "KA", same: true}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(4, 4), color: 0, piece: "KA", same: true, capture: "FU"}},
            );
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("promote:false, drop", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "KA"}},
                {move: {from: p(3, 1), piece: "GI", same: true}},
                {move: {piece: "KA", to: p(4, 5)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                {move: {to: p(4, 5), color: 0, piece: "KA"}},
            );
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("hit, with piece", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), piece: "KE"}},
                {move: {from: p(2, 2), piece: "KA", promote: true, same: true}},
                {move: {from: p(8, 8), piece: "KA", same: true}},
                {move: {piece: "KE", to: p(3, 3)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("fork", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), piece: "KE"}, forks: [
                    [
                        {move: {from: p(8, 8), to: p(2, 2), piece: "KA"}},
                        {move: {from: p(3, 1), same: true, piece: "GI"}},
                        {move: {piece: "KA", to: p(4, 5)}},
                    ],
                ]},
                {move: {from: p(2, 2), same: true, piece: "KA", promote: true}},
                {move: {from: p(8, 8), same: true, piece: "KA"}},
                {move: {piece: "KE", to: p(3, 3)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}, forks: [
                    [
                        {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                        {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                        {move: {to: p(4, 5), color: 0, piece: "KA"}},
                    ],
                ]},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("error", () => {
            actual.moves.push(
                {move: {from: p(7, 6), to: p(6, 6), piece: "FU"}},
            );
            expect(() => {
                normalizeKIF(actual);
            }).toThrow();
        });
        it("same at first fork", () => {
            actual.moves.push(
                {move: {from: {x: 7, y: 7}, piece: "FU", to: {x: 7, y: 6}}},
                {move: {from: {x: 3, y: 3}, piece: "FU", to: {x: 3, y: 4}}},
                {
                    move: {from: {x: 2, y: 7}, piece: "FU", to: {x: 2, y: 6}},
                    forks: [
                        [
                            {
                                move: {
                                    from: {x: 8, y: 8},
                                    piece: "KA",
                                    promote: true,
                                    to: {x: 2, y: 2},
                                },
                            },
                            {
                                move: {from: {x: 3, y: 1}, piece: "GI", same: true},
                                forks: [
                                    [
                                        {move: {from: {x: 8, y: 2}, piece: "HI", same: true}},
                                        {special: "JISHOGI"},
                                    ],
                                ],
                            },
                            {special: "CHUDAN"},
                        ],
                    ],
                },
                {special: "TORYO"},
            );
            expect(normalizeKIF(actual)).toMatchSnapshot();
        });
    });
    describe("normalizeKI2", () => {
        let actual;
        let expected;
        beforeEach(() => {
            actual = {
                header: {},
                moves: [{}],
            };
            expected = {
                header: {},
                moves: [{}],
            };
        });
        it("no move", () => {
            expect(normalizeKI2(actual)).toEqual(expected);
            actual.moves.pop();
            expected.moves.pop();
            expect(normalizeKI2(actual)).toEqual(expected);
        });
        it("normal", () => {
            actual.moves[1] = {move: {to: p(7, 6), piece: "FU"}};
            expected.moves[1] = {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}};
            expect(normalizeKI2(actual)).toEqual(expected);
        });
        it("same, capture", () => {
            actual.moves.push(
                {move: {to: p(7, 6), piece: "FU"}},
                {move: {to: p(4, 4), piece: "FU"}},
                {move: {to: p(4, 4), piece: "KA", same: true}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(4, 4), color: 0, piece: "KA", same: true, capture: "FU"}},
            );
            expect(normalizeKI2(actual)).toEqual(expected);
        });
        it("hit, with piece", () => {
            actual.moves.push(
                {move: {to: p(7, 6), piece: "FU"}},
                {move: {to: p(3, 4), piece: "FU"}},
                {move: {to: p(7, 7), piece: "KE"}},
                {move: {piece: "KA", promote: true, same: true}},
                {move: {piece: "KA", same: true}},
                {move: {piece: "KE", to: p(3, 3), relative: "H"}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeKI2(actual)).toEqual(expected);
        });
        it("promote:false, drop", () => {
            actual.moves.push(
                {move: {to: p(7, 6), piece: "FU"}},
                {move: {to: p(3, 4), piece: "FU"}},
                {move: {to: p(2, 2), piece: "KA", promote: false}},
                {move: {piece: "GI", same: true}},
                {move: {piece: "KA", to: p(4, 5)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                {move: {to: p(4, 5), color: 0, piece: "KA"}},
            );
            expect(normalizeKI2(actual)).toEqual(expected);
        });
        describe("relative", () => {
            it("normal", () => {
                actual.moves.push(
                    {move: {to: p(5, 8), piece: "KI", relative: "R"}},
                );
                expected.moves.push(
                    {move: {from: p(4, 9), to: p(5, 8), color: 0, piece: "KI", relative: "R"}},
                );
                expect(normalizeKI2(actual)).toEqual(expected);
            });
            it("insufficient", () => {
                actual.moves.push(
                    {move: {to: p(5, 8), piece: "KI"}},
                );
                expect(() => {
                    normalizeKI2(actual);
                }).toThrow();
            });
            it("malformed", () => {
                actual.moves.push(
                    {move: {to: p(5, 8), piece: "KI", relative: "C"}},
                );
                expect(() => {
                    normalizeKI2(actual);
                }).toThrow();
            });
        });
        it("fork", () => {
            actual.moves.push(
                {move: {to: p(7, 6), piece: "FU"}},
                {move: {to: p(3, 4), piece: "FU"}},
                {move: {to: p(7, 7), piece: "KE"}, forks: [
                    [
                        {move: {to: p(2, 2), piece: "KA", promote: false}},
                        {move: {same: true, piece: "GI"}},
                        {move: {piece: "KA", to: p(4, 5)}},
                    ],
                ]},
                {move: {same: true, piece: "KA", promote: true}},
                {move: {same: true, piece: "KA"}},
                {move: {piece: "KE", to: p(3, 3), relative: "H"}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}, forks: [
                    [
                        {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                        {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                        {move: {to: p(4, 5), color: 0, piece: "KA"}},
                    ],
                ]},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeKI2(actual)).toEqual(expected);
        });
        describe("moveSatisfiesRelative", () => {
            let actual;
            let expected;
            beforeEach(() => {
                actual = {
                    header: {},
                    moves: [{}],
                };
                expected = {
                    header: {},
                    moves: [{}],
                };
            });
            it("L", () => {
                actual.moves.push(
                    {move: {piece: "KI", to: p(5, 8), relative: "L"}},
                );
                expected.moves.push(
                    {move: {from: p(6, 9), to: p(5, 8), color: 0, piece: "KI", relative: "L"}},
                );
                expect(normalizeKI2(actual)).toEqual(expected);
            });
            it("U", () => {
                actual.moves.push(
                    {move: {to: p(4, 8), piece: "KI"}},
                    {move: {to: p(4, 4), piece: "FU"}},
                    {move: {to: p(5, 8), piece: "KI", relative: "U"}},
                );
                expected.moves.push(
                    {move: {from: p(4, 9), to: p(4, 8), color: 0, piece: "KI"}},
                    {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                    {move: {from: p(6, 9), to: p(5, 8), color: 0, piece: "KI", relative: "U"}},
                );
                expect(normalizeKI2(actual)).toEqual(expected);
            });
            it("M", () => {
                actual.moves.push(
                    {move: {to: p(4, 8), piece: "KI"}},
                    {move: {to: p(4, 4), piece: "FU"}},
                    {move: {to: p(5, 8), piece: "KI", relative: "M"}},
                );
                expected.moves.push(
                    {move: {from: p(4, 9), to: p(4, 8), color: 0, piece: "KI"}},
                    {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                    {move: {from: p(4, 8), to: p(5, 8), color: 0, piece: "KI", relative: "M"}},
                );
                expect(normalizeKI2(actual)).toEqual(expected);
            });
            it("D", () => {
                actual.moves.push(
                    {move: {to: p(5, 8), piece: "KI", relative: "R"}},
                    {move: {to: p(4, 4), piece: "FU"}},
                    {move: {to: p(4, 8), piece: "OU"}},
                    {move: {to: p(4, 5), piece: "FU"}},
                    {move: {to: p(5, 9), piece: "KI", relative: "D"}},
                );
                expected.moves.push(
                    {move: {from: p(4, 9), to: p(5, 8), color: 0, piece: "KI", relative: "R"}},
                    {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                    {move: {from: p(5, 9), to: p(4, 8), color: 0, piece: "OU"}},
                    {move: {from: p(4, 4), to: p(4, 5), color: 1, piece: "FU"}},
                    {move: {from: p(5, 8), to: p(5, 9), color: 0, piece: "KI", relative: "D"}},
                );
                expect(normalizeKI2(actual)).toEqual(expected);
            });
            it("no C for UM and RY", () => {
                actual.moves.push(
                        {move: {from: p(7, 7), to: p(7, 6)}},
                        {move: {from: p(3, 3), to: p(3, 4)}},
                        {move: {from: p(8, 8), to: p(2, 2), promote: true}},
                        {move: {from: p(4, 1), to: p(3, 2)}},
                        {move: {piece: "KA", to: p(4, 1)}},
                        {move: {from: p(9, 3), to: p(9, 4)}},
                        {move: {from: p(4, 1), to: p(3, 2), piece: "KA", promote: true}},
                        {move: {from: p(9, 4), to: p(9, 5), piece: "FU"}},
                        {move: {from: p(2, 2), to: p(2, 1), piece: "UM"}},
                        );
                expected.moves.push(
                        {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}},
                        {move: {from: p(3, 3), to: p(3, 4), piece: "FU", color: 1}},
                        {move: {from: p(8, 8), to: p(2, 2), promote: true, piece: "KA", capture: "KA", color: 0}},
                        {move: {from: p(4, 1), to: p(3, 2), piece: "KI", color: 1}},
                        {move: {piece: "KA", to: p(4, 1), color: 0}},
                        {move: {from: p(9, 3), to: p(9, 4), piece: "FU", color: 1}},
                        {move: {from: p(4, 1), to: p(3, 2), piece: "KA", color: 0, promote: true, capture: "KI"}},
                        {move: {from: p(9, 4), to: p(9, 5), piece: "FU", color: 1}},
                        {move: {from: p(2, 2), to: p(2, 1), color: 0, piece: "UM", relative: "R", capture: "KE"}},
                        );
                expect(normalizeMinimal(actual)).toEqual(expected);
            });
        });
        it("error", () => {
            actual.moves.push(
                {move: {from: p(7, 6), to: p(7, 5), piece: "FU"}},
            );
            expect(() => {
                normalizeKI2(actual);
            }).toThrow();
        });
    });
    describe("normalizeCSA", () => {
        let actual;
        let expected;
        beforeEach(() => {
            actual = {
                header: {},
                moves: [{}],
            };
            expected = {
                header: {},
                moves: [{}],
            };
        });
        it("no move", () => {
            expect(normalizeCSA(actual)).toEqual(expected);
            actual.moves.pop();
            expected.moves.pop();
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("normal", () => {
            actual.moves[1] = {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}};
            expected.moves[1] = {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}};
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("same, capture", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(4, 3), to: p(4, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(4, 4), piece: "KA"}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(4, 4), color: 0, piece: "KA", same: true, capture: "FU"}},
            );
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("hit, promote", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), piece: "KE"}},
                {move: {from: p(2, 2), to: p(7, 7), piece: "UM"}},
                {move: {from: p(8, 8), to: p(7, 7), piece: "KA"}},
                {move: {piece: "KE", to: p(3, 3)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}},
                {move: {from: p(2, 2), to: p(7, 7), color: 1, piece: "KA", capture: "KE", promote: true, same: true}},
                {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
            );
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("promote:false, drop", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "KA"}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                {move: {piece: "KA", to: p(4, 5)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: false}},
                {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                {move: {to: p(4, 5), color: 0, piece: "KA"}},
            );
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("keep promote", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}},
                {move: {from: p(4, 1), to: p(4, 2), piece: "KI"}},
                {move: {from: p(2, 2), to: p(1, 1), piece: "UM"}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), color: 0, piece: "KA", capture: "KA", promote: true}},
                {move: {from: p(4, 1), to: p(4, 2), color: 1, piece: "KI"}},
                {move: {from: p(2, 2), to: p(1, 1), color: 0, piece: "UM", capture: "KY"}},
            );
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("error", () => {
            actual.moves.push(
                {move: {from: p(7, 6), to: p(7, 5), piece: "FU"}},
            );
            expect(() => {
                normalizeCSA(actual);
            }).toThrow();
        });
        it("recover total time", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, time: {now: {m: 0, s: 12}}}, // totalはnormalizerが復元
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}, time: {now: {m: 0, s: 2}}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}, time: {now: {m: 1, s: 40}}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}, time: {now: {m: 0, s: 1}}},
                {move: {to: p(4, 5), piece: "KA"}, time: {now: {m: 0, s: 0}}},
            );
            expected.moves.push(
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}, time: {now: {m: 0, s: 12}, total: {h: 0, m: 0, s: 12}}}, // totalはnormalizerが復元
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU", color: 1}, time: {now: {m: 0, s: 2}, total: {h: 0, m: 0, s: 2}}},
                    {move: {from: p(8, 8), to: p(2, 2), piece: "KA", capture: "KA", promote: true, color: 0}, time: {now: {m: 1, s: 40}, total: {h: 0, m: 1, s: 52}}},
                    {move: {from: p(3, 1), to: p(2, 2), piece: "GI", capture: "UM", same: true, color: 1}, time: {now: {m: 0, s: 1}, total: {h: 0, m: 0, s: 3}}},
                    {move: {to: p(4, 5), piece: "KA", color: 0}, time: {now: {m: 0, s: 0}, total: {h: 0, m: 1, s: 52}}},
            );
            expect(normalizeCSA(actual)).toEqual(expected);
        });
    });
    describe("addRelativeInformation", () => {
        let actual;
        let expected;
        beforeEach(() => {
            actual = {
                header: {},
                moves: [{}],
            };
            expected = {
                header: {},
                moves: [{}],
            };
        });
        it("U", () => {
            actual.moves.push(
                {move: {from: p(4, 9), to: p(4, 8)}},
                {move: {from: p(4, 3), to: p(4, 4)}},
                {move: {from: p(6, 9), to: p(5, 8)}},
            );
            expected.moves.push(
                {move: {from: p(4, 9), to: p(4, 8), color: 0, piece: "KI"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(6, 9), to: p(5, 8), color: 0, piece: "KI", relative: "U"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("M", () => {
            actual.moves.push(
                {move: {from: p(4, 9), to: p(4, 8)}},
                {move: {from: p(4, 3), to: p(4, 4)}},
                {move: {from: p(4, 8), to: p(5, 8)}},
            );
            expected.moves.push(
                {move: {from: p(4, 9), to: p(4, 8), color: 0, piece: "KI"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(4, 8), to: p(5, 8), color: 0, piece: "KI", relative: "M"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("D, L", () => {
            actual.moves.push(
                {move: {from: p(6, 9), to: p(5, 8), piece: "KI"}},
                {move: {from: p(4, 3), to: p(4, 4), piece: "FU"}},
                {move: {from: p(5, 9), to: p(4, 8), piece: "OU"}},
                {move: {from: p(4, 4), to: p(4, 5), piece: "FU"}},
                {move: {from: p(5, 8), to: p(5, 9), piece: "KI"}},
            );
            expected.moves.push(
                {move: {from: p(6, 9), to: p(5, 8), color: 0, piece: "KI", relative: "L"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(5, 9), to: p(4, 8), color: 0, piece: "OU"}},
                {move: {from: p(4, 4), to: p(4, 5), color: 1, piece: "FU"}},
                {move: {from: p(5, 8), to: p(5, 9), color: 0, piece: "KI", relative: "D"}},
            );
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("R", () => {
            actual.moves.push(
                {move: {from: p(4, 9), to: p(5, 8)}},
            );
            expected.moves.push(
                {move: {from: p(4, 9), to: p(5, 8), color: 0, piece: "KI", relative: "R"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("RU", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6)}},
                {move: {from: p(3, 3), to: p(3, 4)}},
                {move: {from: p(8, 8), to: p(2, 2), promote: true}},
                {move: {from: p(4, 1), to: p(3, 2)}},
                {move: {from: p(2, 2), to: p(3, 2)}},
                {move: {from: p(3, 1), to: p(3, 2)}},
                {move: {piece: "KI", to: p(4, 8)}},
                {move: {from: p(3, 2), to: p(3, 3), piece: "GI"}},
                {move: {from: p(4, 9), to: p(5, 8)}},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU", color: 1}},
                {move: {from: p(8, 8), to: p(2, 2), promote: true, piece: "KA", capture: "KA", color: 0}},
                {move: {from: p(4, 1), to: p(3, 2), piece: "KI", color: 1}},
                {move: {from: p(2, 2), to: p(3, 2), piece: "UM", color: 0, capture: "KI", same: true}},
                {move: {from: p(3, 1), to: p(3, 2), piece: "GI", color: 1, capture: "UM", same: true}},
                {move: {piece: "KI", to: p(4, 8), color: 0, relative: "H"}},
                {move: {from: p(3, 2), to: p(3, 3), piece: "GI", color: 1}},
                {move: {from: p(4, 9), to: p(5, 8), color: 0, piece: "KI", relative: "RU"}},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
        it("C", () => {
            actual.moves.push(
                {move: {from: p(5, 9), to: p(6, 8), piece: "OU"}},
                {move: {from: p(4, 3), to: p(4, 4), piece: "FU"}},
                {move: {from: p(6, 9), to: p(5, 9), piece: "KI"}},
                {move: {from: p(4, 4), to: p(4, 5), piece: "FU"}},
                {move: {from: p(4, 9), to: p(4, 8), piece: "KI"}},
            );
            expected.moves.push(
                {move: {from: p(5, 9), to: p(6, 8), color: 0, piece: "OU"}},
                {move: {from: p(4, 3), to: p(4, 4), color: 1, piece: "FU"}},
                {move: {from: p(6, 9), to: p(5, 9), color: 0, piece: "KI", relative: "L"}},
                {move: {from: p(4, 4), to: p(4, 5), color: 1, piece: "FU"}},
                {move: {from: p(4, 9), to: p(4, 8), color: 0, piece: "KI", relative: "C"}},
            );
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("no C for UM and RY", () => {
            actual.moves.push(
                {move: {from: p(7, 7), to: p(7, 6)}},
                {move: {from: p(3, 3), to: p(3, 4)}},
                {move: {from: p(8, 8), to: p(2, 2), promote: true}},
                {move: {from: p(4, 1), to: p(3, 2)}},
                {move: {piece: "KA", to: p(4, 1)}},
                {move: {from: p(9, 3), to: p(9, 4)}},
                {move: {from: p(4, 1), to: p(3, 2), piece: "KA", promote: true}},
                {move: {from: p(9, 4), to: p(9, 5), piece: "FU"}},
                {move: {from: p(2, 2), to: p(2, 1), piece: "UM"}, forks: [
                    [{move: {from: p(3, 2), to: p(3, 1), piece: "UM"}}],
                ]},
            );
            expected.moves.push(
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU", color: 1}},
                {move: {from: p(8, 8), to: p(2, 2), promote: true, piece: "KA", capture: "KA", color: 0}},
                {move: {from: p(4, 1), to: p(3, 2), piece: "KI", color: 1}},
                {move: {piece: "KA", to: p(4, 1), color: 0}},
                {move: {from: p(9, 3), to: p(9, 4), piece: "FU", color: 1}},
                {move: {from: p(4, 1), to: p(3, 2), piece: "KA", color: 0, promote: true, capture: "KI"}},
                {move: {from: p(9, 4), to: p(9, 5), piece: "FU", color: 1}},
                {move: {from: p(2, 2), to: p(2, 1), color: 0, piece: "UM", relative: "R", capture: "KE"}, forks: [
                    [{move: {from: p(3, 2), to: p(3, 1), color: 0, piece: "UM", relative: "L", capture: "GI"}}],
                ]},
            );
            expect(normalizeMinimal(actual)).toEqual(expected);
        });
    });
    describe("restorePreset", () => {
        it("HIRATE", () => {
            const actual: IJSONKifuFormat = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            const expected = {
                header: {},
                initial: {preset: "HIRATE"},
                moves: [{}],
            };
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("HIRATE but different turn", () => {
            const actual: IJSONKifuFormat = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            const expected = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("HIRATE but different hand", () => {
            const actual: IJSONKifuFormat = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 1, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            const expected = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "KY" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 1, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("8", () => {
            const actual: IJSONKifuFormat = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            const expected = {
                header: {},
                initial: {preset: "8"},
                moves: [{}],
            };
            expect(normalizeCSA(actual)).toEqual(expected);
        });
        it("8 but different turn", () => {
            const actual: IJSONKifuFormat = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            const expected = {
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                          }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [{}],
            };
            expect(normalizeCSA(actual)).toEqual(expected);
        });
    });
    describe("restoreColorOfIllegalAction", () => {
        it("normal", () => {
            const actual = {
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {special: "ILLEGAL_ACTION"},
                ],
            };
            const expected = {
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}},
                    {special: "+ILLEGAL_ACTION"},
                ],
            };
            // @ts-ignore
            expect(normalizeKIF(actual)).toEqual(expected);
        });
        it("fork", () => {
            const actual = {
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, forks: [
                        [{special: "ILLEGAL_ACTION"}],
                        [{move: {from: p(2, 7), to: p(2, 6), piece: "FU"}}, {special: "ILLEGAL_ACTION"}],
                    ]},
                    {special: "ILLEGAL_ACTION"},
                ],
            };
            const expected = {
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}, forks: [
                        [{special: "-ILLEGAL_ACTION"}],
                        [{move: {from: p(2, 7), to: p(2, 6), piece: "FU", color: 0}}, {special: "+ILLEGAL_ACTION"}],
                    ]},
                    {special: "+ILLEGAL_ACTION"},
                ],
            };
            // @ts-ignore
            expect(normalizeKIF(actual)).toEqual(expected); // TODO: Fix type error
        });
    });
});
