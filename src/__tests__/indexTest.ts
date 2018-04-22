import "jest";
import * as KifuForJS from "../index";
import fetchFileRaw from "../utils/fetchFile";

jest.mock("../utils/fetchFile");

const fetchFile: any = fetchFileRaw;

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

const KI2_STRING = `▲７六歩△３四歩`;

const KIF_STRING_ILLEGAL = `#KIF version=2.0 encoding=Shift_JIS
# ---- Kifu for Windows V7 V7.08 棋譜ファイル ----
開始日時：2014/10/12 14:46:51
終了日時：2014/10/12 14:47:55
手合割：平手　　
先手：sente
後手：gote
手数----指手---------消費時間--
   1 ７六歩(77)   ( 0:02/00:00:02)
   2 ３四歩(33)   ( 0:05/00:00:05)
   3 ２一角成(88) ( 0:06/00:00:08)
   4 中断         ( 0:51/00:00:56)
まで3手で中断`;

// TODO Fix TS error
describe("loadFile", () => {
    it("plays KIF without errors", async () => {
        fetchFile.mockResolvedValue(KIF_STRING);
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.load("somewhere.kif", "kifu");
        expect(kifuStore.player.tesuu).toBe(0)
        expect(kifuStore.player.kifu.moves.length).toBe(5)
        expect(kifuStore.errors).toHaveLength(0);
    });

    it("shows an error about illegal kifu", async () => {
        fetchFile.mockResolvedValue(KIF_STRING_ILLEGAL);
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.load("somewhere.kif", "kifu");
        expect(kifuStore.player.kifu.moves.length).toBe(1);
        expect(kifuStore.errors).toHaveLength(1);
        expect(kifuStore.errors).toMatchSnapshot();
    });

    it("shows an error about invalid kifu (wrong extension)", async () => {
        fetchFile.mockResolvedValue(KI2_STRING);
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.load("somewhere.kif", "kifu");
        expect(kifuStore.player.kifu.moves.length).toBe(1);
        expect(kifuStore.errors).toHaveLength(1);
        expect(kifuStore.errors).toMatchSnapshot();
    });

    it("shows an error file not found", async () => {
        const filePath = "./not-found.kif";
        fetchFile.mockRejectedValue(`棋譜ファイルが見つかりません: ${filePath}`);
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.load(filePath, "kifu");
        expect(kifuStore.player.kifu.moves.length).toBe(1);
        expect(kifuStore.errors).toHaveLength(1);
        expect(kifuStore.errors).toMatchSnapshot();
    });
});

describe("loadString", () => {
    it("plays KIF without errors", async () => {
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.loadString(KIF_STRING, "kifu");
        expect(kifuStore.player.tesuu).toBe(0)
        expect(kifuStore.player.kifu.moves.length).toBe(5)
    });

    it("plays KI2 without errors", async () => {
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.loadString(KI2_STRING, "kifu");
        expect(kifuStore.player.tesuu).toBe(0)
        expect(kifuStore.player.kifu.moves.length).toBe(3)
    });

    it("shows and error about invalid kifu", async () => {
        document.body.innerHTML = "<div id='kifu'></div>";
        const kifuStore = await KifuForJS.loadString("▲七六歩", "kifu");
        expect(kifuStore.player.kifu.moves.length).toBe(1)
        expect(kifuStore.errors).toMatchSnapshot();
    });
});
