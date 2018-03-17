import fs = require("fs");
import {Iconv} from "iconv";
import jschardet = require("jschardet");
import JKFPlayer from "../jkfplayer";

const sjisIconv = new Iconv("cp932", "utf-8");
const FILES_DIR = __dirname + "/../../test/files";

makeTest("kif", (filename) => filename.match(/u$/) ? loadUTF : loadSJIS);
makeTest("ki2", (filename) => filename.match(/u$/) ? loadUTF : loadSJIS);
makeTest("csa", (filename) => loadAuto);
makeTest("jkf", (filename) => loadUTF);

function makeTest(ext, fileNameToLoadFunc) {
    const datas = {};
    describe(ext + " file", () => {
        const files = fs.readdirSync(FILES_DIR + "/" + ext);
        for (const file of files) {
            (((filename) => {
                if (!filename.match(new RegExp("\\." + ext + "u?$"))) { return; }
                it(filename, (done) => {
                    try {
                        fileNameToLoadFunc(filename)(FILES_DIR + "/" + ext + "/" + filename, (err, data) => {
                            if (err) {
                                done(err);
                                return;
                            }
                            data = data.replace(/^\ufeff/, ""); // delete BOM
                            try {
                                const player = JKFPlayer["parse" + ext.toUpperCase()](data);
                                player.goto(Infinity);
                                player.goto(0);
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                });
            })(file));
        }
    });
}
function loadUTF(filename, cb) {
    fs.readFile(filename, {encoding: "utf-8"}, cb);
}
function loadSJIS(filename, cb) {
    fs.readFile(filename, (err, data) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, sjisIconv.convert(data).toString());
    });
}
function loadAuto(filename, cb) {
    fs.readFile(filename, (err, data) => {
        if (err) {
            cb(err);
            return;
        }
        const iconv = new Iconv(jschardet.detect(data).encoding, "utf-8");
        cb(null, iconv.convert(data).toString());
    });
}
