import "jest";
import {parseCSA as parse} from "../parsers";
/* tslint:disable:object-literal-sort-keys max-line-length */

function p(x, y) {
    return {x, y};
}
describe("csa-parser V2", () => {
    let initial;
    beforeEach(() => {
        initial = {
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
        };
    });
    it("simple", () => {
        expect(parse("\
V2.2\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+8822UM\n\
-3122GI\n\
+0045KA\n")).toEqual({
            header: {},
            initial, // normalizerがpresetを復元する
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                {move: {to: p(4, 5), piece: "KA"}},
            ],
        });
    });
    it("comment", () => {
        expect(parse("\
V2.2\n\
PI\n\
+\n\
'開始時コメント\n\
+7776FU\n\
'初手コメント\n\
'初手コメント2\n\
-3334FU\n\
+8822UM\n")).toEqual({
            header: {},
            initial,
            moves: [
                {comments: ["開始時コメント"]},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, comments: ["初手コメント", "初手コメント2"]},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}},
            ],
        });
    });
    it("special", () => {
        expect(parse("\
V2.2\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n")).toEqual({
            header: {},
            initial,
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(7, 9), to: p(7, 8), piece: "GI"}},
                {move: {from: p(2, 2), to: p(8, 8), piece: "UM"}},
                {special: "TORYO"},
            ],
        });
    });
    it("comma", () => {
        expect(parse("\
V2.2\n\
PI\n\
+\n\
+7776FU,T12,-3334FU,T2\n\
+8822UM,T100\n\
-3122GI,T1\n\
+0045KA,T0\n")).toEqual({
            header: {},
            initial, // normalizerがpresetを復元する
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, time: {now: {m: 0, s: 12}}}, // totalはnormalizerが復元
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}, time: {now: {m: 0, s: 2}}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}, time: {now: {m: 1, s: 40}}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}, time: {now: {m: 0, s: 1}}},
                {move: {to: p(4, 5), piece: "KA"}, time: {now: {m: 0, s: 0}}},
            ],
        });
    });
    it("time", () => {
        expect(parse("\
V2.2\n\
PI\n\
+\n\
+7776FU\n\
T12\n\
-3334FU\n\
T2\n\
+8822UM\n\
T100\n\
-3122GI\n\
T1\n\
+0045KA\n\
T0\n")).toEqual({
            header: {},
            initial, // normalizerがpresetを復元する
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, time: {now: {m: 0, s: 12}}}, // totalはnormalizerが復元
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}, time: {now: {m: 0, s: 2}}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}, time: {now: {m: 1, s: 40}}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}, time: {now: {m: 0, s: 1}}},
                {move: {to: p(4, 5), piece: "KA"}, time: {now: {m: 0, s: 0}}},
            ],
        });
    });
    describe("開始局面", () => {
        it("平手初期局面", () => {
            expect(parse("\
V2.2\n\
PI82HI22KA91KY81KE21KE11KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n")).toEqual({
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {from: p(5, 1), to: p(4, 2), piece: "OU"}},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                    {move: {from: p(8, 8), to: p(6, 6), piece: "KA"}},
                    {move: {from: p(7, 1), to: p(8, 2), piece: "GI"}},
                ],
            });
        });
        it("一括表現", () => {
            expect(parse("\
V2.2\n\
P1 *  * -GI-KI-OU-KI-GI *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3+FU+FU+FU+FU+FU+FU+FU+FU+FU\n\
P1 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n")).toEqual({
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {from: p(5, 1), to: p(4, 2), piece: "OU"}},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                    {move: {from: p(8, 8), to: p(6, 6), piece: "KA"}},
                    {move: {from: p(7, 1), to: p(8, 2), piece: "GI"}},
                ],
            });
        });
        it("駒別単独表現", () => {
            expect(parse("\
V2.2\n\
P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU\n\
P+00HI00HI00KY00KY00KY00KY\n\
P-00GI00GI00GI00GI00KE00KE00KE00KE\n\
+\n\
+0013KY\n\
-0012KE\n\
+1312NY\n")).toEqual({
                header:    {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{color: 1, kind: "OU"}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 4, KE: 0, GI: 0, KI: 0, KA: 0, HI: 2},
                            {FU: 0, KY: 0, KE: 4, GI: 4, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {to: p(1, 3), piece: "KY"}},
                    {move: {to: p(1, 2), piece: "KE"}},
                    {move: {from: p(1, 3), to: p(1, 2), piece: "NY"}},
                ],
            });
        });
        it("AL", () => {
            expect(parse("\
V2.2\n\
P+23FU\n\
P-11OU21KE\n\
P+00KI\n\
P-00AL\n\
+\n\
+0022KI\n\
%TSUMI\n")).toEqual({
                header:    {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{color: 1, kind: "OU"}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{color: 1, kind: "KE"}, {}, {color: 0, kind: "FU"}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 1, KA: 0, HI: 0},
                            {FU: 17, KY: 4, KE: 3, GI: 4, KI: 3, KA: 2, HI: 2},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {to: p(2, 2), piece: "KI"}},
                    {special: "TSUMI"},
                ],
            });
        });
    });
    it("header", () => {
        expect(parse("\
V2.2\n\
N+sente\n\
N-gote\n\
$SITE:将棋会館\n\
$START_TIME:2015/08/04 13:00:00\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n")).toEqual({
            header: {
                先手: "sente",
                後手: "gote",
                場所: "将棋会館",
                開始日時: "2015/08/04 13:00:00",
            },
            initial,
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(7, 9), to: p(7, 8), piece: "GI"}},
                {move: {from: p(2, 2), to: p(8, 8), piece: "UM"}},
                {special: "TORYO"},
            ],
        });
    });
    it("separator -- csa file can contain multiple kifus");
});
describe("csa-parser V1", () => {
    let initial;
    beforeEach(() => {
        initial = {
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
        };
    });
    it("simple", () => {
        expect(parse("\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+8822UM\n\
-3122GI\n\
+0045KA\n")).toEqual({
            header: {},
            initial, // normalizerがpresetを復元する
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                {move: {to: p(4, 5), piece: "KA"}},
            ],
        });
    });
    it("comment", () => {
        expect(parse("\
PI\n\
+\n\
'開始時コメント\n\
+7776FU\n\
'初手コメント\n\
'初手コメント2\n\
-3334FU\n\
+8822UM\n")).toEqual({
            header: {},
            initial,
            moves: [
                {comments: ["開始時コメント"]},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, comments: ["初手コメント", "初手コメント2"]},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}},
            ],
        });
    });
    it("special", () => {
        expect(parse("\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n")).toEqual({
            header: {},
            initial,
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(7, 9), to: p(7, 8), piece: "GI"}},
                {move: {from: p(2, 2), to: p(8, 8), piece: "UM"}},
                {special: "TORYO"},
            ],
        });
    });
    it("comma", () => {
        expect(parse("\
PI\n\
+\n\
+7776FU,T12,-3334FU,T2\n\
+8822UM,T100\n\
-3122GI,T1\n\
+0045KA,T0\n")).toEqual({
            header: {},
            initial, // normalizerがpresetを復元する
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, time: {now: {m: 0, s: 12}}}, // totalはnormalizerが復元
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}, time: {now: {m: 0, s: 2}}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}, time: {now: {m: 1, s: 40}}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}, time: {now: {m: 0, s: 1}}},
                {move: {to: p(4, 5), piece: "KA"}, time: {now: {m: 0, s: 0}}},
            ],
        });
    });
    it("time", () => {
        expect(parse("\
PI\n\
+\n\
+7776FU\n\
T12\n\
-3334FU\n\
T2\n\
+8822UM\n\
T100\n\
-3122GI\n\
T1\n\
+0045KA\n\
T0\n")).toEqual({
            header: {},
            initial, // normalizerがpresetを復元する
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, time: {now: {m: 0, s: 12}}}, // totalはnormalizerが復元
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}, time: {now: {m: 0, s: 2}}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "UM"}, time: {now: {m: 1, s: 40}}},
                {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}, time: {now: {m: 0, s: 1}}},
                {move: {to: p(4, 5), piece: "KA"}, time: {now: {m: 0, s: 0}}},
            ],
        });
    });
    describe("開始局面", () => {
        it("平手初期局面", () => {
            expect(parse("\
PI82HI22KA91KY81KE21KE11KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n")).toEqual({
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {from: p(5, 1), to: p(4, 2), piece: "OU"}},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                    {move: {from: p(8, 8), to: p(6, 6), piece: "KA"}},
                    {move: {from: p(7, 1), to: p(8, 2), piece: "GI"}},
                ],
            });
        });
        it("一括表現", () => {
            expect(parse("\
P1 *  * -GI-KI-OU-KI-GI *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3+FU+FU+FU+FU+FU+FU+FU+FU+FU\n\
P1 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n")).toEqual({
                header: {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "OU" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "OU" }],
                            [{ color: 1, kind: "KI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KI" }],
                            [{ color: 1, kind: "GI" }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "GI" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                            [{                      }, {}, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {}, { color: 0, kind: "KY" }],
                        ],
                        color: 1,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {from: p(5, 1), to: p(4, 2), piece: "OU"}},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 1), to: p(2, 2), piece: "GI"}},
                    {move: {from: p(8, 8), to: p(6, 6), piece: "KA"}},
                    {move: {from: p(7, 1), to: p(8, 2), piece: "GI"}},
                ],
            });
        });
        it("駒別単独表現", () => {
            expect(parse("\
P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU\n\
P+00HI00HI00KY00KY00KY00KY\n\
P-00GI00GI00GI00GI00KE00KE00KE00KE\n\
+\n\
+0013KY\n\
-0012KE\n\
+1312NY\n")).toEqual({
                header:    {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{color: 1, kind: "OU"}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}, {color: 1, kind: "FU"}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 4, KE: 0, GI: 0, KI: 0, KA: 0, HI: 2},
                            {FU: 0, KY: 0, KE: 4, GI: 4, KI: 0, KA: 0, HI: 0},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {to: p(1, 3), piece: "KY"}},
                    {move: {to: p(1, 2), piece: "KE"}},
                    {move: {from: p(1, 3), to: p(1, 2), piece: "NY"}},
                ],
            });
        });
        it("AL", () => {
            expect(parse("\
V2.2\n\
P+23FU\n\
P-11OU21KE\n\
P+00KI\n\
P-00AL\n\
+\n\
+0022KI\n\
%TSUMI\n")).toEqual({
                header:    {},
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{color: 1, kind: "OU"}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{color: 1, kind: "KE"}, {}, {color: 0, kind: "FU"}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                        ],
                        color: 0,
                        hands: [
                            {FU: 0, KY: 0, KE: 0, GI: 0, KI: 1, KA: 0, HI: 0},
                            {FU: 17, KY: 4, KE: 3, GI: 4, KI: 3, KA: 2, HI: 2},
                        ],
                    },
                },
                moves: [
                    {},
                    {move: {to: p(2, 2), piece: "KI"}},
                    {special: "TSUMI"},
                ],
            });
        });
    });
    it("header", () => {
        expect(parse("\
N+sente\n\
N-gote\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n")).toEqual({
            header: {
                先手: "sente",
                後手: "gote",
            },
            initial,
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(7, 9), to: p(7, 8), piece: "GI"}},
                {move: {from: p(2, 2), to: p(8, 8), piece: "UM"}},
                {special: "TORYO"},
            ],
        });
    });
});
