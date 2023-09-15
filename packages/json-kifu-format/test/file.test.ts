import {readdirSync, promises} from "fs";
import {decode} from "iconv-lite";
import {detect} from "jschardet";
import JKFPlayer from "../src/jkfplayer";

const {readFile} = promises;

const SJIS = "cp932";
const FILES_DIR = __dirname + "/files";

makeTest("kif", (filename) => (filename.match(/u$/) ? loadUTF(filename) : loadSJIS(filename)));
makeTest("ki2", (filename) => (filename.match(/u$/) ? loadUTF(filename) : loadSJIS(filename)));
makeTest("csa", (filename) => loadAuto(filename));
makeTest("jkf", (filename) => loadUTF(filename));

function makeTest(ext: string, loader: (filename: string) => Promise<string>) {
    describe(ext + " file", () => {
        const files = readdirSync(FILES_DIR + "/" + ext);
        for (const filename of files) {
            if (!filename.match(new RegExp("\\." + ext + "u?$"))) {
                return;
            }
            // eslint-disable-next-line jest/valid-title
            it(filename, async () => {
                let data = await loader(FILES_DIR + "/" + ext + "/" + filename);
                data = data.replace(/^\ufeff/, ""); // delete BOM

                const player: JKFPlayer = JKFPlayer["parse" + ext.toUpperCase()](data);
                player.goto(Infinity);
                player.goto(0);
                expect(player.kifu).toMatchSnapshot();
            });
        }
    });
}

async function loadUTF(filename: string) {
    return readFile(filename, {encoding: "utf-8"});
}

async function loadSJIS(filename: string) {
    const data = await readFile(filename);
    return decode(data, SJIS);
}

async function loadAuto(filename: string) {
    const data = await readFile(filename);
    const {encoding} = detect(data);
    return decode(data, encoding);
}
