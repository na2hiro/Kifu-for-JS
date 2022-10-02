import {parseCSA as parse} from "../parsers";

describe("csa-parser V2", () => {
    it("matches snapshot for simple case", () => {
        expect(
            parse(`V2.2
PI
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
                `V2.2
PI
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
            parse(`V2.2
PI
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
                `V2.2
PI
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
                `V2.2
PI
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
    describe("initial field", () => {
        it("supports 平手初期局面 (PI)", () => {
            expect(
                parse(
                    `V2.2
PI82HI22KA91KY81KE21KE11KY
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
                    `V2.2
P1 *  * -GI-KI-OU-KI-GI *  * 
P1 *  *  *  *  *  *  *  *  * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P1 *  *  *  *  *  *  *  *  * 
P1 *  *  *  *  *  *  *  *  * 
P1 *  *  *  *  *  *  *  *  * 
P3+FU+FU+FU+FU+FU+FU+FU+FU+FU
P1 * +KA *  *  *  *  * +HI * 
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
                    `V2.2
P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU
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
                    parse(`V2.2
P+23TO
P-11OU21KE
P+00KI
P-00AL
+
+0022KI
%TSUMI
`).initial
                ).toMatchSnapshot();
            });
        });
        it("works with 一括表現", () => {
            expect(
                parse(`P1 *  *  *  *  *  *  *  *  * 
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
    it("supports header", () => {
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
describe("csa-parser V1", () => {
    it("matches snapshot for simple case", () => {
        expect(parse(`PI
+
+7776FU
-3334FU
+8822UM
-3122GI
+0045KA
`)).toMatchSnapshot();
    });
    it("supports comments", () => {
        expect(
            parse(
                `PI
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
        expect(parse(`PI
+
+7776FU
-3334FU
+7978GI
-2288UM
%TORYO
`).moves).toMatchSnapshot();
    });
    it("supports multiple statements with commas", () => {
        expect(
            parse(`PI
+
+7776FU,T12,-3334FU,T2
+8822UM,T100
-3122GI,T1
+0045KA,T0
`).moves
        ).toMatchSnapshot();
    });
    it("supports time", () => {
        expect(
            parse(
                `PI
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
    describe("initial field", () => {
        it("supports 平手初期局面 (PI)", () => {
            expect(
                parse(
                    `PI82HI22KA91KY81KE21KE11KY
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
                    `P1 *  * -GI-KI-OU-KI-GI *  * 
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
                    `P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU
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
        it("00AL stands for the rest", () => {
            expect(
                parse(`P+23FU
P-11OU21KE
P+00KI
P-00AL
+
+0022KI
%TSUMI
`).initial
            ).toMatchSnapshot();
        });
    });
    it("supports header", () => {
        expect(
            parse(`N+sente
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
});
