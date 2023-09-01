// TODO: fix TS error for editors
import {parse} from "./csa-parser.pegjs";

describe("V2 parser for V2 formats", () => {
    it("supports header with $ markups", () => {
        expect(
            parse(
                `V2.2
N+sente
N-gote
$SITE:将棋会館
$START_TIME:2015/08/04 13:00:00
PI
+
+7776FU
-3334FU
+7978GI
-2288UM
%TORYO
`
            ).header
        ).toMatchInlineSnapshot(`
            Object {
              "先手": "sente",
              "場所": "将棋会館",
              "後手": "gote",
              "開始日時": "2015/08/04 13:00:00",
            }
        `);
    });
    it.todo("separator -- csa file can contain multiple kifus");
});

describe.each([
    {v: "V1", prefix: ""},
    {v: "V2", prefix: "V2.2\n"},
])("$v parser for V1 formats", ({prefix}) => {
    it("matches snapshot for simple case", () => {
        expect(
            parse(`${prefix}PI
+
+7776FU
-3334FU
+8822UM
-3122GI
+0045KA
`)
        ).toMatchSnapshot();
    });
    it("supports comments", () => {
        expect(
            parse(
                `${prefix}PI
+
'開始時コメント
+7776FU
'初手コメント
'初手コメント2
-3334FU
+8822UM
`
            ).moves
        ).toMatchSnapshot();
    });
    it("supports special moves", () => {
        expect(
            parse(`${prefix}PI
+
+7776FU
-3334FU
+7978GI
-2288UM
%TORYO
`).moves
        ).toMatchSnapshot();
    });
    it("supports multiple statements with commas", () => {
        expect(
            parse(
                `${prefix}PI
+
+7776FU,T12,-3334FU,T2
+8822UM,T100
-3122GI,T1
+0045KA,T0
`
            ).moves
        ).toMatchSnapshot();
    });
    it("supports time", () => {
        expect(
            parse(
                `${prefix}PI
+
+7776FU
T12
-3334FU
T2
+8822UM
T100
-3122GI
T1
+0045KA
T0
`
            ).moves
        ).toMatchSnapshot();
    });
    it("supports header", () => {
        expect(
            parse(`${prefix}N+sente
N-gote
PI
+
+7776FU
-3334FU
+7978GI
-2288UM
%TORYO
`).header
        ).toMatchSnapshot();
    });
    describe("initial field", () => {
        it("supports 平手初期局面 (PI)", () => {
            expect(
                parse(
                    `${prefix}PI82HI22KA91KY81KE21KE11KY
-
-5142OU
+7776FU
-3122GI
+8866KA
-7182GI
`
                ).initial
            ).toMatchSnapshot();
        });
        it("supports 一括表現", () => {
            expect(
                parse(
                    `${prefix}P1 *  * -GI-KI-OU-KI-GI *  * 
P2 *  *  *  *  *  *  *  *  * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  *  *  *  * 
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU
P8 * +KA *  *  *  *  * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
-
-5142OU
+7776FU
-3122GI
+8866KA
-7182GI
`
                ).initial
            ).toMatchSnapshot();
        });
        it("supports 駒別単独表現", () => {
            expect(
                parse(
                    `${prefix}P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU
P+00HI00HI00KY00KY00KY00KY
P-00GI00GI00GI00GI00KE00KE00KE00KE
+
+0013KY
-0012KE
+1312NY
`
                ).initial
            ).toMatchSnapshot();
        });
        describe("00AL stands for the rest", () => {
            it("works with 駒別単独", () => {
                expect(
                    parse(`${prefix}P+23TO
P-11OU21KE
P+00KI
P-00AL
+
+0022KI
%TSUMI
`).initial
                ).toMatchSnapshot();
            });
            it("works with 一括表現", () => {
                expect(
                    parse(`${prefix}P1 *  *  *  *  *  *  *  *  * 
P2 *  *  *  *  *  *  *  *  * 
P3 *  *  * -FU-FU *  *  *  * 
P4-RY *  * -OU * -FU *  *  * 
P5 *  * +KY * -TO *  *  *  * 
P6 *  * +RY *  *  *  *  *  * 
P7+KA *  *  *  *  *  *  *  * 
P8+KA *  *  *  *  *  *  *  * 
P9 *  *  *  *  *  *  *  *  * 
P-00AL
+
`).initial
                ).toMatchSnapshot();
            });
        });
    });
});
