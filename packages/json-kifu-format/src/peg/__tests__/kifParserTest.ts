/* eslint-disable no-irregular-whitespace */
import {parseKIF as parse} from "../parsers";

function p(x, y) {
    return {x, y};
}
describe("kif-parser", () => {
    it("simple", () => {
        expect(
            parse("1 ７六歩(77)\n2 ３四歩(33)\n3 ２二角成(88)\n 4 同　銀(31)\n5 ４五角打\n")
        ).toEqual({
            header: {},
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
                {move: {from: p(3, 1), same: true, piece: "GI"}},
                {move: {to: p(4, 5), piece: "KA"}},
            ],
        });
    });
    it("comment", () => {
        expect(
            parse(
                "*開始時コメント\n1 ７六歩(77)\n*初手コメント\n*初手コメント2\n2 ３四歩(33)\n3 ２二角成(88)\n"
            )
        ).toEqual({
            header: {},
            moves: [
                {comments: ["開始時コメント"]},
                {
                    move: {from: p(7, 7), to: p(7, 6), piece: "FU"},
                    comments: ["初手コメント", "初手コメント2"],
                },
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
            ],
        });
    });
    it("time", () => {
        expect(
            parse(
                "1 ７六歩(77) (0:01/00:00:01)\n2 ３四歩(33) (0:02/00:00:02)\n3 ２二角成(88) (0:20/00:00:21)\n 4 同　銀(31) (0:03/00:00:05)\n5 ４五角打 (0:39/00:01:00)\n"
            )
        ).toEqual({
            header: {},
            moves: [
                {},
                {
                    move: {from: p(7, 7), to: p(7, 6), piece: "FU"},
                    time: {now: {m: 0, s: 1}, total: {h: 0, m: 0, s: 1}},
                },
                {
                    move: {from: p(3, 3), to: p(3, 4), piece: "FU"},
                    time: {now: {m: 0, s: 2}, total: {h: 0, m: 0, s: 2}},
                },
                {
                    move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true},
                    time: {now: {m: 0, s: 20}, total: {h: 0, m: 0, s: 21}},
                },
                {
                    move: {from: p(3, 1), same: true, piece: "GI"},
                    time: {now: {m: 0, s: 3}, total: {h: 0, m: 0, s: 5}},
                },
                {
                    move: {to: p(4, 5), piece: "KA"},
                    time: {now: {m: 0, s: 39}, total: {h: 0, m: 1, s: 0}},
                },
            ],
        });
    });
    it("special", () => {
        expect(
            parse(
                "1 ７六歩(77)\n2 ３四歩(33)\n3 ７八銀(79)\n 4 ８八角成(22)\n5 投了\nまで4手で後手の勝ち\n"
            )
        ).toEqual({
            header: {},
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                {move: {from: p(7, 9), to: p(7, 8), piece: "GI"}},
                {move: {from: p(2, 2), to: p(8, 8), piece: "KA", promote: true}},
                {special: "TORYO"},
            ],
        });
    });
    describe("header", () => {
        it("手合割", () => {
            expect(
                parse(
                    "手合割：平手\n1 ７六歩(77)\n2 ３四歩(33)\n3 ２二角成(88)\n 4 同　銀(31)\n5 ４五角打\n"
                )
            ).toEqual({
                header: {
                    手合割: "平手",
                },
                initial: {preset: "HIRATE"},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                    {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
                    {move: {from: p(3, 1), same: true, piece: "GI"}},
                    {move: {to: p(4, 5), piece: "KA"}},
                ],
            });
            expect(
                parse(
                    "手合割：六枚落ち\n1 ４二玉(51)\n2 ７六歩(77)\n3 ２二銀(31)\n 4 ６六角(88)\n5 ８二銀(71)\n"
                )
            ).toEqual({
                header: {
                    手合割: "六枚落ち",
                },
                initial: {preset: "6"},
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
    });
    describe("initial", () => {
        it("simple", () => {
            expect(
                parse(
                    "\
手合割：その他　\n\
上手の持駒：銀四　桂四　\n\
  ９ ８ ７ ６ ５ ４ ３ ２ １\n\
+---------------------------+\n\
| ・ ・ ・ ・ ・ ・ ・v歩v玉|一\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|二\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|三\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|四\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|五\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|六\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|七\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|八\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|九\n\
+---------------------------+\n\
下手の持駒：飛二　香四　\n\
下手番\n\
下手：shitate\n\
上手：uwate\n\
1 １三香打\n2 １二桂打\n3 同　香成(13)\n"
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
                    {move: {from: p(1, 3), same: true, piece: "KY", promote: true}},
                ],
            });
        });
        it("Kifu for iPhone dialect", () => {
            // 持ち駒が半角スペース区切り
            // 手合割が平手
            expect(
                parse(
                    "\
手合割：平手\n\
上手の持駒：銀四 桂四 \n\
  ９ ８ ７ ６ ５ ４ ３ ２ １\n\
+---------------------------+\n\
| ・ ・ ・ ・ ・ ・ ・v歩v玉|一\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|二\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|三\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|四\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|五\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|六\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|七\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|八\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|九\n\
+---------------------------+\n\
下手の持駒：飛二 香四 \n\
下手番\n\
下手：shitate\n\
上手：uwate\n\
1 １三香打\n2 １二桂打\n3 同　香成(13)\n"
                )
            ).toEqual({
                header: {
                    手合割: "平手",
                    上手: "uwate",
                    下手: "shitate",
                },
                initial: {
                    preset: "OTHER", // 上書き
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
                    {move: {from: p(1, 3), same: true, piece: "KY", promote: true}},
                ],
            });
        });
    });
    describe("fork", () => {
        it("normal", () => {
            expect(
                parse(
                    "\
手合割：平手\n\
1 ７六歩(77)\n\
2 ３四歩(33)\n\
3 ２二角成(88)+\n\
4 同　銀(31)\n\
5 ４五角打\n\
6 中断\n\
\n\
変化：3手\n\
3 ６六歩(67)\n\
4 ８四歩(83)\n\
"
                )
            ).toEqual({
                header: {
                    手合割: "平手",
                },
                initial: {preset: "HIRATE"},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                    {
                        move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true},
                        forks: [
                            [
                                //                            {},
                                {move: {from: p(6, 7), to: p(6, 6), piece: "FU"}},
                                {move: {from: p(8, 3), to: p(8, 4), piece: "FU"}},
                            ],
                        ],
                    },
                    {move: {from: p(3, 1), same: true, piece: "GI"}},
                    {move: {to: p(4, 5), piece: "KA"}},
                    {special: "CHUDAN"},
                ],
            });
        });

        it("Multiple forks", () => {
            expect(
                parse(
                    "1 ７六歩(77)+\n" +
                        "2 ３四歩(33)+\n" +
                        "\n" +
                        "変化：2手\n" +
                        "2 ８四歩(83)+\n" +
                        "\n" +
                        "変化：2手\n" +
                        "2 ４四歩(43)\n" +
                        "\n" +
                        "変化：1手\n" +
                        "1 ２六歩(27)+\n" +
                        "\n" +
                        "変化：1手\n" +
                        "1 ８六歩(87)+\n" +
                        "\n" +
                        "変化：1手\n" +
                        "1 ７八金(69)\n"
                )
            ).toEqual({
                header: {},
                moves: [
                    {},
                    {
                        move: {from: p(7, 7), to: p(7, 6), piece: "FU"},
                        forks: [
                            [{move: {from: p(2, 7), to: p(2, 6), piece: "FU"}}],
                            [{move: {from: p(8, 7), to: p(8, 6), piece: "FU"}}],
                            [{move: {from: p(6, 9), to: p(7, 8), piece: "KI"}}],
                        ],
                    },
                    {
                        move: {from: p(3, 3), to: p(3, 4), piece: "FU"},
                        forks: [
                            [{move: {from: p(8, 3), to: p(8, 4), piece: "FU"}}],
                            [{move: {from: p(4, 3), to: p(4, 4), piece: "FU"}}],
                        ],
                    },
                ],
            });
        });
    });
    describe("split", () => {
        it("normal", () => {
            expect(
                parse(
                    "\
手合割：平手\n\
手数----指手--\n\
*開始コメント\n\
1 ７六歩(77)\n\
*初手コメント\n\
2 ３四歩(33)\n\
3 ２二角成(88)+\n\
4 中断\n\
"
                )
            ).toEqual({
                header: {
                    手合割: "平手",
                },
                initial: {preset: "HIRATE"},
                moves: [
                    {comments: ["開始コメント"]},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, comments: ["初手コメント"]},
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                    {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
                    {special: "CHUDAN"},
                ],
            });
        });
        it("after initial comment", () => {
            expect(
                parse(
                    "\
手合割：平手\n\
*開始コメント\n\
手数----指手--\n\
1 ７六歩(77)\n\
*初手コメント\n\
2 ３四歩(33)\n\
3 ２二角成(88)+\n\
4 中断\n\
"
                )
            ).toEqual({
                header: {
                    手合割: "平手",
                },
                initial: {preset: "HIRATE"},
                moves: [
                    {comments: ["開始コメント"]},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}, comments: ["初手コメント"]},
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                    {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
                    {special: "CHUDAN"},
                ],
            });
        });
    });
    describe("unsupported annotations", () => {
        it("盤面回転", () => {
            expect(
                parse(
                    "盤面回転\n1 ７六歩(77)\n2 ３四歩(33)\n3 ２二角成(88)\n 4 同　銀(31)\n5 ４五角打\n"
                )
            ).toEqual({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU"}},
                    {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
                    {move: {from: p(3, 1), same: true, piece: "GI"}},
                    {move: {to: p(4, 5), piece: "KA"}},
                ],
            });
        });
        it("&読み込み時表示", () => {
            expect(
                parse(
                    "1 ７六歩(77)\n2 ３四歩(33)\n&読み込み時表示\n3 ２二角成(88)\n 4 同　銀(31)\n5 ４五角打\n"
                )
            ).toEqual({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
                    {
                        move: {from: p(3, 3), to: p(3, 4), piece: "FU"},
                        comments: ["&読み込み時表示"],
                    },
                    {move: {from: p(8, 8), to: p(2, 2), piece: "KA", promote: true}},
                    {move: {from: p(3, 1), same: true, piece: "GI"}},
                    {move: {to: p(4, 5), piece: "KA"}},
                ],
            });
        });
    });
    it("same at first fork", () => {
        expect(
            parse(`   1 ７六歩(77)   ( 0:00/00:00:00)
   2 ３四歩(33)   ( 0:00/00:00:00)
   3 ２六歩(27)   ( 0:00/00:00:00)
   4 中断         ( 0:00/00:00:00)
まで3手で中断

変化：3手
   3 ２二角成(88) ( 0:00/00:00:00)
   4 同　銀(31)   ( 0:00/00:00:00)+
   5 中断         ( 0:00/00:00:00)
まで4手で中断

変化：4手
   4 同　飛(82)   ( 0:00/00:00:00)
   5 中断         ( 0:00/00:00:00)
まで4手で中断
`)
        ).toMatchSnapshot();
    });
});
