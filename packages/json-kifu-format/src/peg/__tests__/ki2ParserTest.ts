import {parse} from "../ki2-parser.pegjs";

function p(x, y) {
    return {x, y};
}

/* eslint-disable no-irregular-whitespace */
describe("ki2-parser", () => {
    it("simple", () => {
        expect(parse("▲７六歩 △３四歩 ▲２二角成 △同　銀 ▲４五角")).toEqual({
            header: {},
            moves: [
                {},
                {move: {to: p(7, 6), piece: "FU"}},
                {move: {to: p(3, 4), piece: "FU"}},
                {move: {to: p(2, 2), piece: "KA", promote: true}},
                {move: {same: true, piece: "GI"}},
                {move: {to: p(4, 5), piece: "KA"}},
            ],
        });
    });
    it("comment", () => {
        expect(
            parse("*開始時コメント\n▲７六歩\n*初手コメント\n*初手コメント2\n△３四歩 ▲２二角成")
        ).toEqual({
            header: {},
            moves: [
                {comments: ["開始時コメント"]},
                {move: {to: p(7, 6), piece: "FU"}, comments: ["初手コメント", "初手コメント2"]},
                {move: {to: p(3, 4), piece: "FU"}},
                {move: {to: p(2, 2), piece: "KA", promote: true}},
            ],
        });
    });
    it("special", () => {
        expect(parse("▲７六歩 △３四歩 ▲７八銀 △８八角成\nまで4手で後手の勝ち\n")).toEqual({
            header: {},
            moves: [
                {},
                {move: {to: p(7, 6), piece: "FU"}},
                {move: {to: p(3, 4), piece: "FU"}},
                {move: {to: p(7, 8), piece: "GI"}},
                {move: {to: p(8, 8), piece: "KA", promote: true}},
                {special: "TORYO"},
            ],
        });
    });
    describe("header", () => {
        it("手合割", () => {
            expect(parse("手合割：平手\n▲７六歩 △３四歩 ▲２二角成 △同　銀 ▲４五角")).toEqual({
                header: {
                    手合割: "平手",
                },
                initial: {preset: "HIRATE"},
                moves: [
                    {},
                    {move: {to: p(7, 6), piece: "FU"}},
                    {move: {to: p(3, 4), piece: "FU"}},
                    {move: {to: p(2, 2), piece: "KA", promote: true}},
                    {move: {same: true, piece: "GI"}},
                    {move: {to: p(4, 5), piece: "KA"}},
                ],
            });
            expect(parse("手合割：六枚落ち\n△４二玉 ▲７六歩 △２二銀 ▲６六角 △８二銀")).toEqual({
                header: {
                    手合割: "六枚落ち",
                },
                initial: {preset: "6"},
                moves: [
                    {},
                    {move: {to: p(4, 2), piece: "OU"}},
                    {move: {to: p(7, 6), piece: "FU"}},
                    {move: {to: p(2, 2), piece: "GI"}},
                    {move: {to: p(6, 6), piece: "KA"}},
                    {move: {to: p(8, 2), piece: "GI"}},
                ],
            });
        });
    });
    describe("initial", () => {
        it("simple", () => {
            expect(
                parse(
                    `手合割：その他　
上手の持駒：銀四　桂四　
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・v歩v玉|一
| ・ ・ ・ ・ ・ ・ ・v歩 ・|二
| ・ ・ ・ ・ ・ ・ ・v歩 ・|三
| ・ ・ ・ ・ ・ ・ ・v歩 ・|四
| ・ ・ ・ ・ ・ ・ ・v歩 ・|五
| ・ ・ ・ ・ ・ ・ ・v歩 ・|六
| ・ ・ ・ ・ ・ ・ ・v歩 ・|七
| ・ ・ ・ ・ ・ ・ ・v歩 ・|八
| ・ ・ ・ ・ ・ ・ ・v歩 ・|九
+---------------------------+
下手の持駒：飛二　香四　
下手番
下手：shitate
上手：uwate
▲１三香 △１二桂 ▲同香成`
                )
            ).toEqual({
                header: {
                    手合割: "その他　",
                    上手: "uwate",
                    下手: "shitate",
                },
                initial: {
                    preset: "OTHER",
                    data: {
                        board: [
                            [{color: 1, kind: "OU"}, {}, {}, {}, {}, {}, {}, {}, {}],
                            [
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                                {color: 1, kind: "FU"},
                            ],
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
                    {move: {same: true, piece: "KY", promote: true}},
                ],
            });
        });
    });
    describe("fork", () => {
        it("normal", () => {
            expect(
                parse(
                    `手合割：平手
▲７六歩 △３四歩 ▲２二角成 △同　銀 ▲４五角
まで5手で中断

変化：3手
▲６六歩 △８四歩
`
                )
            ).toEqual({
                header: {
                    手合割: "平手",
                },
                initial: {preset: "HIRATE"},
                moves: [
                    {},
                    {move: {to: p(7, 6), piece: "FU"}},
                    {move: {to: p(3, 4), piece: "FU"}},
                    {
                        move: {to: p(2, 2), piece: "KA", promote: true},
                        forks: [
                            [
                                //                            {},
                                {move: {to: p(6, 6), piece: "FU"}},
                                {move: {to: p(8, 4), piece: "FU"}},
                            ],
                        ],
                    },
                    {move: {same: true, piece: "GI"}},
                    {move: {to: p(4, 5), piece: "KA"}},
                    {special: "CHUDAN"},
                ],
            });
        });

        it("Multiple forks", () => {
            expect(
                parse(
                    `▲７六歩 △３四歩

変化：2手
△８四歩

変化：2手
△４四歩

変化：1手
▲２六歩

変化：1手
▲８六歩

変化：1手
▲７八金`
                )
            ).toEqual({
                header: {},
                moves: [
                    {},
                    {
                        move: {to: p(7, 6), piece: "FU"},
                        forks: [
                            [{move: {to: p(2, 6), piece: "FU"}}],
                            [{move: {to: p(8, 6), piece: "FU"}}],
                            [{move: {to: p(7, 8), piece: "KI"}}],
                        ],
                    },
                    {
                        move: {to: p(3, 4), piece: "FU"},
                        forks: [
                            [{move: {to: p(8, 4), piece: "FU"}}],
                            [{move: {to: p(4, 4), piece: "FU"}}],
                        ],
                    },
                ],
            });
        });
    });
});
