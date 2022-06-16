import {readdirSync, readFile} from "fs";
import {decode} from "iconv-lite";
import "jest";
import {detect} from "jschardet";
import JKFPlayer from "../jkfplayer";

const SJIS = "cp932";
const FILES_DIR = __dirname + "/../../test/files";

makeTest("kif", (filename) => (filename.match(/u$/) ? loadUTF : loadSJIS));
makeTest("ki2", (filename) => (filename.match(/u$/) ? loadUTF : loadSJIS));
makeTest("csa", (filename) => loadAuto);
makeTest("jkf", (filename) => loadUTF);

function makeTest(ext, fileNameToLoadFunc) {
    const datas = {};
    describe(ext + " file", () => {
        const files = readdirSync(FILES_DIR + "/" + ext);
        for (const file of files) {
            ((filename) => {
                if (!filename.match(new RegExp("\\." + ext + "u?$"))) {
                    return;
                }
                it(filename, (done) => {
                    try {
                        fileNameToLoadFunc(filename)(
                            FILES_DIR + "/" + ext + "/" + filename,
                            (err, data) => {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                data = data.replace(/^\ufeff/, ""); // delete BOM
                                try {
                                    const player: JKFPlayer =
                                        JKFPlayer["parse" + ext.toUpperCase()](data);
                                    player.goto(Infinity);
                                    player.goto(0);
                                    expect(player.kifu).toMatchSnapshot();
                                    done();
                                } catch (e) {
                                    done(e);
                                }
                            }
                        );
                    } catch (e) {
                        done(e);
                    }
                });
            })(file);
        }
    });
}
function loadUTF(filename, cb) {
    readFile(filename, {encoding: "utf-8"}, cb);
}
function loadSJIS(filename, cb) {
    readFile(filename, (err, data) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, decode(data, SJIS));
    });
}
function loadAuto(filename, cb) {
    readFile(filename, (err, data) => {
        if (err) {
            cb(err);
            return;
        }
        const {encoding} = detect(data);
        cb(null, decode(data, encoding));
    });
}
