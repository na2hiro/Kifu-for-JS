import { Color } from "shogi.js";

declare var $; // jQuery

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

function getEncodingFromFileName(filename) {
    const tmp = filename.split(".");
    const ext = tmp[tmp.length - 1];
    return ["jkf", "kifu", "ki2u"].indexOf(ext) >= 0 ? "UTF-8" : "Shift_JIS";
}

export function fetchFile(filePath) {
    return new Promise((resolve, reject) => {
        const encoding = getEncodingFromFileName(filePath);
        /*
        // TODO: Cannot enforce encoding
        return fetch(filePath, {
            headers: {
                "Content-Type": "text/html;charset=" + encoding
            }
        })
            .then((response) => response.text());
        // ignore if notmodified
        */

        $.ajax(filePath, {
            success(data, textStatus) {
                resolve(textStatus === "notmodified" ? null : data);
            },
            error(jqXHR, textStatus) {
                if (textStatus !== "notmodified") {
                    let message = "棋譜の取得に失敗しました: " + filePath;
                    if (document.location.protocol === "file:") {
                        message += `

【備考】
Ajaxのセキュリティ制約により，ローカルの棋譜の読み込みが制限されている可能性があります．
サーバ上にアップロードして動作をご確認下さい．
もしくは，棋譜ファイルのドラッグ&ドロップによる読み込み機能をお試し下さい．`;
                    }
                    reject(message);
                }
            },
            beforeSend(xhr) {
                xhr.overrideMimeType("text/html;charset=" + encoding);
            },
            ifModified: true,
        });
    });
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
