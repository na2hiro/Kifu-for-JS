import { Color } from "shogi.js";

export function colorToMark(color) {
    return color === Color.Black ? "☗" : "☖";
}

// ファイルオブジェクトと読み込み完了後のコールバック関数を渡す
// 読み込み完了後，callback(ファイル内容, ファイル名)を呼ぶ
export function loadFile(file, callback) {
    const reader = new FileReader();
    const encoding = getEncodingFromFileName(file.name);
    reader.onload = () => {
        callback(reader.result, file.name);
    };
    reader.readAsText(file, encoding);
}

export function getEncodingFromFileName(filename) {
    const tmp = filename.split(".");
    const ext = tmp[tmp.length - 1];
    return ["jkf", "kifu", "ki2u"].indexOf(ext) >= 0 ? "UTF-8" : "Shift_JIS";
}

export function onDomReady(callback) {
    if (
        document.readyState === "complete" ||
        (document.readyState !== "loading" && !(document.documentElement as any).doScroll)
    ) {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

export function removeIndentation(indentedKifu: string) {
    console.log("removeIndentation", indentedKifu);
    const firstNonEmptyLine = indentedKifu.split("\n").filter((s) => s != "")[0];
    if (!firstNonEmptyLine) return indentedKifu;
    const match = /(\s+)/.exec(firstNonEmptyLine);
    if (!match) return indentedKifu;
    let illicitLine = false;
    const indentRemoved = indentedKifu
        .split("\n")
        .map((line) => {
            if (line.startsWith(match[1])) {
                return line.slice(match[1].length);
            } else if (line === "") {
                return line;
            }
            illicitLine = true;
            return line;
        })
        .join("\n");

    return illicitLine ? indentedKifu : indentRemoved;
}
