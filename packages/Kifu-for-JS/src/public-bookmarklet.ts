import type KifuStore from "./common/stores/KifuStore";
import type { load, loadString } from "./index";
import { getDivWithId, searchForRecovery } from "./utils/recover";

function fail(e): KifuStore[] {
    alert("読み込みに失敗しました: " + e);
    throw e;
}

async function main() {
    if ("getSelection" in window && getSelection().toString() !== "") {
        const Kifu = await loadKifuForJS();
        const selection = getSelection();
        const id = makeRandomId();
        selection.focusNode.parentNode.insertBefore(getDivWithId(id), selection.focusNode.nextSibling);
        return Promise.all([Kifu.loadString(selection.toString(), id)]);
    } else {
        const targets = await searchForRecovery();
        if (targets.length === 0) {
            throw new Error("将棋盤が見つかりませんでした");
        }
        const Kifu = await loadKifuForJS();

        return Promise.all(
            targets.map((target) => {
                return Kifu.load(target.kifuPath, target.targetId);
            }),
        );
    }
}

function makeRandomId() {
    return "kifuforjs_" + Math.random().toString(36).slice(2);
}

export default main().catch(fail);

async function loadKifuForJS(): Promise<{ load: typeof load; loadString: typeof loadString }> {
    return await import(/* webpackChunkName: "KifuInBookmarklet" */ "./index");
}
