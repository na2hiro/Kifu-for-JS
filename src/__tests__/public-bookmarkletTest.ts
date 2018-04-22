import "jest";
const fs = require("fs");
import * as $ from "jquery";

jest.mock("../index");

const expectedId = expect.stringContaining("kifuforjs");
(window as any).$ = $;

const KIF_STRING = `#KIF version=2.0 encoding=Shift_JIS
# ---- Kifu for Windows V7 V7.08 棋譜ファイル ----
開始日時：2014/10/12 14:46:51
終了日時：2014/10/12 14:47:55
手合割：平手　　
先手：sente
後手：gote
手数----指手---------消費時間--
   1 ７六歩(77)   ( 0:02/00:00:02)
   2 ３四歩(33)   ( 0:05/00:00:05)
   3 ２二角成(88) ( 0:06/00:00:08)
   4 中断         ( 0:51/00:00:56)
まで3手で中断
`;

let KifuForJS;

beforeEach(() => {
    window.alert = jest.fn();
    jest.resetModules();
    KifuForJS = require("../index");
});

// TODO Fix TS error
describe("Bookmarklet without selection", () => {
    it("works ok with kifu for java replacement", async () => {
        const file = fs.readFileSync(`${__dirname}/../../test/htmls/kifu-for-java-body.html`).toString();
        document.body.innerHTML = file;

        await import("../public-bookmarklet");
        expect(KifuForJS.load).toHaveBeenCalledTimes(2);
        expect(KifuForJS.load).toBeCalledWith("./henka.kif", expectedId);
        expect(KifuForJS.load).toBeCalledWith("./tume.kif", expectedId);
    });

    it("works ok with kifu for flash replacement", async () => {
        const file = fs.readFileSync(`${__dirname}/../../test/htmls/kifu-for-flash-body.html`).toString();
        document.body.innerHTML = file;

        await import("../public-bookmarklet");
        expect(KifuForJS.load).toHaveBeenCalledTimes(1);
        expect(KifuForJS.load).toBeCalledWith("henka.kif", expectedId);
    });

    it("works ok with kifu for flash (swfobject.js) replacement", async () => {
        const file = fs.readFileSync(`${__dirname}/../../test/htmls/kifu-for-flash-swfobject-body.html`).toString();
        document.body.innerHTML = file;

        await import("../public-bookmarklet");
        expect(KifuForJS.load).toHaveBeenCalledTimes(1);
        expect(KifuForJS.load).toBeCalledWith("no_henka.kifu", "flashcontent");
    });

    it("shows alert when there is nothing replace", async () => {
        document.body.innerHTML = "";

        try{
            KifuForJS.load.mockClear();
            KifuForJS.loadString.mockClear();
            await import("../public-bookmarklet");
            fail("should fail");
        } catch (e) {
            // ok
        }
        expect(KifuForJS.load).not.toBeCalled();
        expect(window.alert).toBeCalled();
    });
});

describe("Bookmarklet with selection", () => {
    it("works ok", async () => {
        const KIFU = "▲２六歩△３四歩▲２五歩△３三角";
        document.body.innerHTML = "<div id='kifu''>棋譜：▲２六歩△３四歩▲２五歩△３三角</div>";
        window.getSelection = jest.fn(() => ({
            focusNode: document.getElementById("kifu"),
            toString() {
                return KIFU;
            }
        }));

        await import("../public-bookmarklet");
        expect(KifuForJS.loadString).toHaveBeenCalledTimes(1);
        expect(KifuForJS.loadString).toBeCalledWith(KIFU, expectedId);
    });

    it("works also ok with invalid kifu", async () => {
        const INVALID_KIFU = "棋譜";
        document.body.innerHTML = "<div id='kifu''>棋譜：▲２六歩△３四歩▲２五歩△３三角</div>";
        window.getSelection = jest.fn(() => ({
            focusNode: document.getElementById("kifu"),
            toString() {
                return INVALID_KIFU;
            }
        }));

        await import("../public-bookmarklet");
        expect(KifuForJS.loadString).toHaveBeenCalledTimes(1);
        expect(KifuForJS.loadString).toBeCalledWith(INVALID_KIFU, expectedId);
    });
});
