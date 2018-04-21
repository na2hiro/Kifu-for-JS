import {getEncodingFromFileName} from "./util";

declare var $; // jQuery

export default function fetchFile(filePath): Promise<string> {
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
                    let message = `棋譜ファイルが見つかりません: ${filePath}`;
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
