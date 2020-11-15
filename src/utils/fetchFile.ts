import {getEncodingFromFileName} from "./util";

export default function fetchFile(filePath): Promise<string> {
    return new Promise((resolve, reject) => {
        const encoding = getEncodingFromFileName(filePath);

        const request = new XMLHttpRequest();
        request.open('GET', filePath, true);
        request.overrideMimeType("text/html;charset=" + encoding);

        request.onload = function() {
            if (this.status === 304) {
                resolve(null);
            } else if (this.status >= 200 && this.status < 400) {
                resolve(this.response);
            } else {
                const message = `棋譜ファイルが取得できません (${this.status}): ${filePath}`;
                reject(message);
            }
        };

        request.onerror = () => {
            let message = `棋譜ファイルが取得できません: ${filePath}`;
            if (document.location.protocol === "file:") {
                message += `

【備考】
Ajaxのセキュリティ制約により，ローカルの棋譜の読み込みが制限されている可能性があります．
ページをサーバ上にアップロードして動作をご確認下さい．
もしくは，棋譜ファイルのドラッグ&ドロップによる読み込み機能をお試し下さい．`;
            }
            reject(message);
        };

        request.send();
    });
}
