import "jest";
import JKFPlayer from "../jkfplayer";
/* tslint:disable:object-literal-sort-keys max-line-length no-unused-expression */

// TODO Fix type errors

function p(x, y) {
    return {x, y};
}

describe("class Player", () => {
    it("new", () => {
        new JKFPlayer({
            header: {},
            moves: [{}],
        });
    });
    describe("parse", () => {
        it("kif", () => {
            JKFPlayer.parseKIF("1 ７六歩\n");
            JKFPlayer.parse("1 ７六歩\n");
            JKFPlayer.parse("1 ７六歩\n", "hoge.kif");
        });
        it("ki2", () => {
            JKFPlayer.parseKI2("▲７六歩");
            JKFPlayer.parse("▲７六歩");
            JKFPlayer.parse("▲７六歩", "./hoge.ki2");
        });
        it("csa", () => {
            JKFPlayer.parseCSA("PI\n+\n");
            JKFPlayer.parse("PI\n+\n");
            JKFPlayer.parse("PI\n+\n", "http://shogitter.com/kifu/hoge.csa");
        });
        it("jkf", () => {
            JKFPlayer.parseJKF('{"header":{},"moves":[]}');
            JKFPlayer.parse('{"header":{},"moves":[]}');
            JKFPlayer.parse('{"header":{},"moves":[]}', "hoge.jkf");
        });
        it("illegal", () => {
            expect(() => {
                JKFPlayer.parse("ふが");
            }).toThrow();
        });
    });
    describe("forward", () => {
        it("normal", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                    {move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}},
                    {
                        move: {
                            from: p(2, 2),
                            to: p(7, 7),
                            color: 1,
                            piece: "KA",
                            capture: "KE",
                            promote: true,
                            same: true,
                        },
                    },
                    {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                    {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
                ],
            });
            expect(player.shogi.toCSAString()).toBe("\
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n\
P2 * -HI *  *  *  *  * -KA * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P4 *  *  *  *  *  *  *  *  * \n\
P5 *  *  *  *  *  *  *  *  * \n\
P6 *  *  *  *  *  *  *  *  * \n\
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU\n\
P8 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
P+\n\
P-\n\
+");
            expect(player.forward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe("\
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n\
P2 * -HI *  *  *  *  * -KA * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P4 *  *  *  *  *  *  *  *  * \n\
P5 *  *  *  *  *  *  *  *  * \n\
P6 *  * +FU *  *  *  *  *  * \n\
P7+FU+FU * +FU+FU+FU+FU+FU+FU\n\
P8 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
P+\n\
P-\n\
-");
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            const sixth = "\
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n\
P2 * -HI *  *  *  *  *  *  * \n\
P3-FU-FU-FU-FU-FU-FU-KE-FU-FU\n\
P4 *  *  *  *  *  * -FU *  * \n\
P5 *  *  *  *  *  *  *  *  * \n\
P6 *  * +FU *  *  *  *  *  * \n\
P7+FU+FU+KA+FU+FU+FU+FU+FU+FU\n\
P8 *  *  *  *  *  *  * +HI * \n\
P9+KY * +GI+KI+OU+KI+GI+KE+KY\n\
P+00KA\n\
P-\n\
+";
            expect(player.shogi.toCSAString()).toBe(sixth);
            expect(player.forward()).toBeFalsy();
            expect(player.shogi.toCSAString()).toBe(sixth);
        });
        it("with special", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                    {special: "CHUDAN"},
                ],
            });
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            const second = player.shogi.toCSAString();
            expect(player.forward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe(second);
            expect(player.forward()).toBe(false);
            expect(player.shogi.toCSAString()).toBe(second);
        });
    });
    describe("backward", () => {
        it("normal", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                    {special: "CHUDAN"},
                ],
            });
            const first = player.shogi.toCSAString();
            player.forward();
            expect(player.backward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe(first);
            expect(player.backward()).toBeFalsy();
        });
    });
    it("goto, go", () => {
        const player = new JKFPlayer({
            header: {},
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {special: "CHUDAN"},
            ],
        });
        const initial = player.shogi.toCSAString();
        expect(player.tesuu).toBe(0);
        expect(player.forward()).toBeTruthy();
        expect(player.tesuu).toBe(1);
        expect(player.forward());
        expect(player.tesuu).toBe(2);
        const second = player.shogi.toCSAString();
        expect(player.forward());
        expect(player.tesuu).toBe(3);
        expect(player.forward()).toBeFalsy();
        expect(player.tesuu).toBe(3);
        player.goto(0);
        expect(player.tesuu).toBe(0);
        expect(player.shogi.toCSAString()).toBe(initial);
        expect(player.backward()).toBeFalsy();
        expect(player.tesuu).toBe(0);
        player.go(2);
        expect(player.tesuu).toBe(2);
        expect(player.shogi.toCSAString()).toBe(second);
    });
    it("goto, go with string and invalid values", () => {
        const player = new JKFPlayer({
            header: {},
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {special: "CHUDAN"},
            ],
        });
        expect(player.tesuu).toBe(0);
        player.goto("2");
        expect(player.tesuu).toBe(2);
        player.goto("foo");
        expect(player.tesuu).toBe(2);
        player.go("-1");
        expect(player.tesuu).toBe(1);
        player.go("bar");
        expect(player.tesuu).toBe(1);
        player.go("Infinity");
        expect(player.tesuu).toBe(3);
        player.go("-Infinity");
        expect(player.tesuu).toBe(0);
    });
    it("goto Infinity", () => {
        const player = new JKFPlayer({
            header: {},
            moves: [
                {},
                {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                {special: "CHUDAN"},
            ],
        });
        const first = player.shogi.toCSAString();
        expect(player.tesuu).toBe(0);
        player.goto(Infinity); // goto last
        expect(player.tesuu).toBe(3);
        player.goto(-1);
        expect(player.tesuu).toBe(0);
        expect(player.shogi.toCSAString()).toBe(first);
    });
    describe("forkAndForward", () => {
        it("new", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                    {
                        move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}, forks: [
                            [
                                {
                                    move: {
                                        from: p(8, 8),
                                        to: p(2, 2),
                                        color: 0,
                                        piece: "KA",
                                        capture: "KA",
                                        promote: false,
                                    },
                                },
                                {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                                {move: {to: p(4, 5), color: 0, piece: "KA"}},
                            ],
                        ],
                    },
                    {
                        move: {
                            from: p(2, 2),
                            to: p(7, 7),
                            color: 1,
                            piece: "KA",
                            capture: "KE",
                            promote: true,
                            same: true,
                        },
                    },
                    {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                    {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
                ],
            });
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            const beforeFork = player.shogi.toCSAString();
            expect(player.forkAndForward(1)).toBe(false);
            expect(player.shogi.toCSAString()).toBe(beforeFork);
            expect(player.forkAndForward(0)).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.forward()).toBe(false);
            expect(player.backward()).toBeTruthy();
            expect(player.backward()).toBeTruthy();
            expect(player.backward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe(beforeFork);
            expect(player.forkAndForward("0")).toBeTruthy();
        });
    });
    describe("forkPointers, forks, currentStream", () => {
        function duplicate(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
        it("one fork", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}},
                    {move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}},
                    {
                        move: {from: p(8, 9), to: p(7, 7), color: 0, piece: "KE"}, forks: [
                            [
                                {
                                    move: {
                                        from: p(8, 8),
                                        to: p(2, 2),
                                        color: 0,
                                        piece: "KA",
                                        capture: "KA",
                                        promote: false,
                                    },
                                },
                                {move: {from: p(3, 1), to: p(2, 2), color: 1, piece: "GI", capture: "KA", same: true}},
                                {move: {to: p(4, 5), color: 0, piece: "KA"}},
                            ],
                        ],
                    },
                    {
                        move: {
                            from: p(2, 2),
                            to: p(7, 7),
                            color: 1,
                            piece: "KA",
                            capture: "KE",
                            promote: true,
                            same: true,
                        },
                    },
                    {move: {from: p(8, 8), to: p(7, 7), color: 0, piece: "KA", capture: "UM", same: true}},
                    {move: {to: p(3, 3), color: 1, piece: "KE", relative: "H"}},
                ],
            });
            expect(player.forkPointers.length).toBe(0);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(1);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream).toMatchSnapshot("currentStream");
            expect(player.currentStream.length).toBe(7);
            const firstForkPointers = duplicate(player.forkPointers);
            const firstForks = duplicate(player.forks);
            const firstCurrentStream = duplicate(player.currentStream);
            player.goto(2);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream).toMatchSnapshot("currentStream");
            expect(player.forkPointers).toEqual(firstForkPointers);
            expect(player.forks).toEqual(firstForks);
            expect(player.currentStream).toEqual(firstCurrentStream);
            player.forkAndForward(0);
            expect(player.forkPointers.length).toBe(1);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(2);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream.length).toBe(6);
            expect(player.currentStream).toMatchSnapshot("currentStream");
            const secondForkPointers = duplicate(player.forkPointers);
            const secondForks = duplicate(player.forks);
            const secondCurrentStream = duplicate(player.currentStream);
            player.goto(Infinity);
            expect(player.forkPointers).toEqual(secondForkPointers);
            expect(player.forks).toEqual(secondForks);
            expect(player.currentStream).toEqual(secondCurrentStream);
        });
        it("nested fork", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {
                        move: {from: p(7, 7), to: p(7, 6), color: 0, piece: "FU"}, forks: [
                            [
                                {move: {from: p(2, 7), to: p(2, 6), color: 1, piece: "FU"}},
                                {
                                    move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}, forks: [
                                        [
                                            {move: {from: p(8, 3), to: p(8, 4), color: 1, piece: "FU"}},
                                        ],
                                    ],
                                },
                            ],
                        ],
                    },
                    {
                        move: {from: p(5, 3), to: p(5, 4), color: 1, piece: "FU"}, forks: [
                            [
                                {move: {from: p(8, 3), to: p(8, 4), color: 1, piece: "FU"}},
                                {move: {from: p(2, 7), to: p(2, 6), color: 1, piece: "FU"}},
                                {
                                    move: {from: p(3, 3), to: p(3, 4), color: 1, piece: "FU"}, forks: [
                                        [
                                            {move: {from: p(8, 4), to: p(8, 5), color: 1, piece: "FU"}},
                                            {move: {from: p(8, 8), to: p(7, 7), color: 1, piece: "KA"}},
                                        ],
                                    ],
                                },
                            ],
                        ],
                    },
                    {
                        move: {from: p(2, 7), to: p(2, 6), color: 1, piece: "FU"}, forks: [
                            [
                                {
                                    move: {
                                        from: p(8, 8),
                                        to: p(2, 2),
                                        color: 0,
                                        piece: "KA",
                                        capture: "KA",
                                        promote: false,
                                    },
                                },
                            ],
                        ],
                    },
                ],
            });
            const firstForkPointers = duplicate(player.forkPointers);
            const firstForks = duplicate(player.forks);
            const firstCurrentStream = duplicate(player.currentStream);

            expect(player.forkPointers.length).toBe(0);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(1);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream).toMatchSnapshot("currentStream");
            expect(player.currentStream.length).toBe(4);

            // +2726FU
            player.forkAndForward(0);
            expect(player.forkPointers.length).toBe(1);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(2);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream.length).toBe(3);
            expect(player.currentStream).toMatchSnapshot("currentStream");
            // -8384FU
            player.forkAndForward(0);
            expect(player.forkPointers.length).toBe(2);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(3);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream.length).toBe(3);
            expect(player.currentStream).toMatchSnapshot("currentStream");

            player.goto(0);
            expect(player.forkPointers).toEqual(firstForkPointers);
            expect(player.forks).toEqual(firstForks);
            expect(player.currentStream).toEqual(firstCurrentStream);

            // +7776FU
            player.goto(1);
            expect(player.forkPointers).toEqual(firstForkPointers);
            expect(player.forks).toEqual(firstForks);
            expect(player.currentStream).toEqual(firstCurrentStream);

            // -8384FU
            player.forkAndForward(0);
            expect(player.forkPointers.length).toBe(1);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(2);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream.length).toBe(5);
            expect(player.currentStream).toMatchSnapshot("currentStream");

            // +2726FU
            player.goto(3);
            // -8485FU
            player.forkAndForward(0);
            expect(player.forkPointers.length).toBe(2);
            expect(player.forkPointers).toMatchSnapshot("forkPointers");
            expect(player.forks.length).toBe(3);
            expect(player.forks).toMatchSnapshot("forks");
            expect(player.currentStream.length).toBe(6);
            expect(player.currentStream).toMatchSnapshot("currentStream");
        });
    });
    describe("inputMove", () => {
        it("new input", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                ],
            });
            const first = player.shogi.toCSAString();
            expect(player.inputMove({from: p(7, 7), to: p(7, 6)})).toBeTruthy();
            expect(player.inputMove({from: p(3, 3), to: p(3, 4)})).toBeTruthy();
            expect(player.backward()).toBeTruthy();
            expect(player.backward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe(first);
        });
        it("same with existing one", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                ],
            });
            expect(player.inputMove({from: p(7, 7), to: p(7, 6)})).toBeTruthy();
            expect(player.inputMove({from: p(3, 3), to: p(3, 4)})).toBeTruthy();
            expect(player.inputMove({from: p(2, 7), to: p(2, 6)})).toBeTruthy();
            const leaf = player.shogi.toCSAString();
            player.goto(1);
            expect(player.inputMove({from: p(3, 3), to: p(3, 4)})).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe(leaf);
            player.goto(1);
            expect(player.forkAndForward(0)).toBe(false);
        });
        it("same with existing fork", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                ],
            });
            expect(player.inputMove({from: p(7, 7), to: p(7, 6)})).toBeTruthy();
            expect(player.inputMove({from: p(3, 3), to: p(3, 4)})).toBeTruthy();
            expect(player.backward()).toBeTruthy();
            expect(player.inputMove({from: p(1, 3), to: p(1, 4)})).toBeTruthy();
            expect(player.backward()).toBeTruthy();
            expect(player.inputMove({from: p(8, 3), to: p(8, 4)})).toBeTruthy();
            expect(player.inputMove({from: p(2, 7), to: p(2, 6)})).toBeTruthy();
            const leaf = player.shogi.toCSAString();
            player.goto(1);
            expect(player.inputMove({from: p(8, 3), to: p(8, 4)})).toBeTruthy();
            expect(player.forward()).toBeTruthy();
            expect(player.shogi.toCSAString()).toBe(leaf);
            player.goto(1);
            expect(player.forkAndForward(2)).toBe(false);
        });
        it("can't add fork to special", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {special: "CHUDAN"},
                ],
            });
            expect(() => {
                player.forward();
                player.inputMove({from: p(7, 7), to: p(7, 6)});
            }).toThrow();
        });
        it("possibility of promotion", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {},
                    {move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}},
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU", color: 1}},
                ],
            });
            player.goto(2);
            expect(player.inputMove({from: p(8, 8), to: p(2, 2)})).toBe(false);
            expect(player.inputMove({from: p(8, 8), to: p(2, 2), promote: true})).toBeTruthy();
            player.backward();
            expect(player.inputMove({from: p(8, 8), to: p(2, 2), promote: false})).toBeTruthy();
        });
    });
    it("numToZen", () => {
        expect(JKFPlayer.numToZen(7)).toBe("７");
        expect(JKFPlayer.numToZen(9)).toBe("９");
    });
    it("numToKan", () => {
        expect(JKFPlayer.numToKan(7)).toBe("七");
        expect(JKFPlayer.numToKan(9)).toBe("九");
    });
    it("moveToReadableKifu", () => {
        expect(JKFPlayer.moveToReadableKifu({
            move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0},
        })).toBe("☗７六歩");
        expect(JKFPlayer.moveToReadableKifu({
            move: {from: p(2, 3), to: p(2, 4), piece: "FU", color: 1, same: true},
        })).toBe("☖同　歩");
        expect(JKFPlayer.moveToReadableKifu({
            move: {from: p(3, 3), to: p(2, 4), piece: "GI", color: 0, promote: true},
        })).toBe("☗２四銀成");
        expect(JKFPlayer.moveToReadableKifu({
            move: {from: p(3, 3), to: p(2, 4), piece: "GI", color: 0, promote: false},
        })).toBe("☗２四銀不成");
        expect(JKFPlayer.moveToReadableKifu({
            move: {from: p(6, 8), to: p(5, 7), piece: "GI", color: 0, relative: "RU"},
        })).toBe("☗５七銀右上");
        expect(JKFPlayer.moveToReadableKifu({
            special: "TORYO",
        })).toBe("投了");
    });
    describe("wrappers", () => {
        let player;
        beforeEach(() => {
            player = new JKFPlayer({
                header: {},
                moves: [
                    {comments: ["hoge"]},
                    {
                        move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}, forks: [
                            [{move: {from: p(2, 7), to: p(2, 6), piece: "FU", color: 0}}],
                        ],
                    },
                    {move: {from: p(3, 3), to: p(3, 4), piece: "FU", color: 1}},
                ],
            });
        });
        it("getBoard", () => {
            expect(player.getBoard(7, 7)).toEqual({color: 0, kind: "FU"});
            expect(player.getBoard(7, 6)).toBeNull();
        });
        it("getComments", () => {
            expect(player.getComments()).toEqual(["hoge"]);
            expect(player.getComments(2)).toEqual([]);
        });
        it("getMove", () => {
            expect(player.getMove()).toBeUndefined();
            expect(player.getMove(2)).toEqual({from: p(3, 3), to: p(3, 4), piece: "FU", color: 1});
        });
        it("getReadableKifu", () => {
            expect(player.getReadableKifu()).toBe("開始局面");
            expect(player.getReadableKifu(2)).toBe("☖３四歩");
        });
        it("getState", () => {
            expect(player.getState()).toEqual({
                board: [
                    [{ color: 1, kind: "KY" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KY" }],
                    [{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" }],
                    [{ color: 1, kind: "GI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "GI" }],
                    [{ color: 1, kind: "KI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KI" }],
                    [{ color: 1, kind: "OU" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "OU" }],
                    [{ color: 1, kind: "KI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KI" }],
                    [{ color: 1, kind: "GI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "GI" }],
                    [{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" }],
                    [{ color: 1, kind: "KY" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KY" }],
                ],
                color: 0,
                hands: [
                    {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                    {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                ],
            });
        });
        it("getReadableKifuState", () => {
            expect(player.getReadableKifuState()).toEqual([
                {kifu: "開始局面", forks: [], comments: ["hoge"]},
                {kifu: "☗７六歩", forks: ["☗２六歩"], comments: []},
                {kifu: "☖３四歩", forks: [], comments: []},
            ]);
        });
        it("getReadableForkKifu", () => {
            expect(player.getReadableForkKifu(1)).toEqual([]);
            expect(player.getReadableForkKifu()).toEqual(["☗２六歩"]);
        });
        it("getNextFork", () => {
            expect(player.getNextFork(1)).toEqual([]);
            expect(player.getNextFork()).toEqual([
                [{move: {color: 0, from: p(2, 7), piece: "FU", to: p(2, 6)}}],
            ]);
        });
        it("toJKF", () => {
            const jkf = JSON.parse(player.toJKF());
            const player2 = new JKFPlayer(jkf);
            expect(jkf).toEqual(JSON.parse(player2.toJKF()));
        });
        it("getMoveFormat", () => {
            expect(player.getMoveFormat(0)).toEqual({comments: ["hoge"]});
            expect(player.getMoveFormat(1)).toEqual({
                move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0}, forks: [
                    [{move: {from: p(2, 7), to: p(2, 6), piece: "FU", color: 0}}],
                ],
            });
            player.forkAndForward(0);
            expect(player.getMoveFormat(0)).toEqual({comments: ["hoge"]});
            expect(player.getMoveFormat(1)).toEqual({
                move: {from: p(2, 7), to: p(2, 6), piece: "FU", color: 0},
            });
        });
    });
    it("static sameMoveMinimal", () => {
        expect(JKFPlayer.sameMoveMinimal({from: p(2, 3), to: p(2, 2), promote: true}, {
            from: p(2, 3),
            to: p(2, 2),
            promote: true,
            piece: "FU",
        })).toBeTruthy();
        expect(JKFPlayer.sameMoveMinimal({to: p(2, 3), piece: "KY"}, {to: p(2, 3), piece: "KY"})).toBeTruthy();
        expect(JKFPlayer.sameMoveMinimal({from: p(2, 3), to: p(2, 2), promote: false}, {
            from: p(2, 3),
            to: p(2, 2),
            promote: true,
            piece: "FU",
        })).toBe(false);
        expect(JKFPlayer.sameMoveMinimal({to: p(2, 3), piece: "KE"}, {to: p(2, 3), piece: "KY"})).toBeFalsy();
        expect(JKFPlayer.sameMoveMinimal({from: p(2, 7), to: p(2, 6), piece: "FU"}, {
            to: p(2, 6),
            piece: "KA",
        })).toBe(false);
    });
    describe("getMoveFormat", () => {
        it("only one", () => {
            const player = new JKFPlayer({
                header: {},
                moves: [
                    {comments: ["hoge"]},
                    {
                        move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0},
                    },
                ],
            });
            expect(player.getMoveFormat(0)).toEqual({comments: ["hoge"]});
            expect(player.getMoveFormat(1)).toEqual({
                move: {from: p(7, 7), to: p(7, 6), piece: "FU", color: 0},
            });
        });
    });
});
