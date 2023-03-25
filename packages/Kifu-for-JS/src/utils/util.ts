import { Color } from "shogi.js";

export function colorToMark(color) {
    return color === Color.Black ? "☗" : "☖";
}
// length <= 10
export function pad(str, space, length) {
    let ret = "";
    for (let i = str.length; i < length; i++) {
        ret += space;
    }
    return ret + str;
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
