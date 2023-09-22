declare let params; // Flash
declare let so; // Flash

export type RecoveryTarget = {
    kifuPath: string;
    targetId: string;
    method: string;
};

export async function searchForRecovery(): Promise<RecoveryTarget[]> {
    const targetList: RecoveryTarget[] = [];
    document.querySelectorAll("applet param[name=KIFU]").forEach((param: HTMLParamElement) => {
        // applet方式
        // http://kakinoki.o.oo7.jp/kifujf/example.html
        const parent = param.parentElement;
        const base = parent.getAttribute("codebase") || ".";
        const targetId = makeRandomId();
        const kifuPath = base.replace(/\/$/, "") + "/" + param.value;
        parent.replaceWith(getDivWithId(targetId));
        targetList.push({ targetId, kifuPath, method: "applet" });
    });
    document.querySelectorAll("object param[name=FlashVars]").forEach((param: HTMLParamElement) => {
        // object方式 http://kakinoki.o.oo7.jp/flash/example.html
        const parent = param.parentElement;
        let kifuPath;
        param.value.split("&").map((kv) => {
            const s = kv.split("=");
            if (s[0] === "kifu") {
                kifuPath = s[1];
            }
        });
        if (!kifuPath) {
            return;
        }

        const targetId = makeRandomId();
        parent.replaceWith(getDivWithId(targetId));
        targetList.push({ kifuPath, targetId, method: "object" });
    });

    // SWFObject方式
    // ただしFlashが有効であるなどして上記objectで拾われた場合は対応しない
    const flashcontent = document.querySelector("#flashcontent");
    const $so = document.querySelector("#so");
    if (typeof so !== "undefined" && so.variables && so.variables.kifu && flashcontent) {
        // ただしidがflashcontentかつsoオブジェクトが存在する場合のみ)
        // http://kakinoki.o.oo7.jp/flash/resize.html
        flashcontent.replaceWith(getDivWithId("flashcontent"));
        targetList.push({ targetId: "flashcontent", kifuPath: so.variables.kifu, method: "swo_flashcontent" });
    } else if (typeof params !== "undefined" && params.FlashVars && $so) {
        // TODO: Find a page as an example and write tests
        // ただしidがsoかつparamsオブジェクトがある場合
        // http://mainichi.jp/feature/shougi/ohsho/etc/64/150111.html
        let kifuPath;
        params.FlashVars.split("&").forEach((kv) => {
            const s = kv.split("=");
            if (s[0] === "kifu") {
                kifuPath = s[1];
            }
        });
        if (kifuPath) {
            $so.replaceWith(getDivWithId("so"));
            ($so as HTMLElement).style.visibility = "visible";
            targetList.push({ targetId: "so", kifuPath, method: "swo_so" });
        }
    } else {
        // SWFObject方式(script総なめ)
        // http://kiftwi.net/r/YO1ErcFF
        document.querySelectorAll("script").forEach((script) => {
            if (script.textContent.indexOf("SWFObject") < 0) return;
            const kifuMatch = script.textContent.match(/addVariable.+kifu.+"(.+)"/);
            const idMatch = script.textContent.match(/write.+"(.+)"/);
            if (kifuMatch && idMatch) {
                targetList.push({ kifuPath: kifuMatch[1], targetId: idMatch[1], method: "swo_bruteforce" });
            }
        });
    }

    return targetList.map((t) => ({
        ...t,
        kifuPath: t.kifuPath.replace(/\.(z|gz)$/gi, ""),
    }));
}

function makeRandomId() {
    return "kifuforjs_" + Math.random().toString(36).slice(2);
}

export function getDivWithId(id: string) {
    const div = document.createElement("div");
    div.id = id;
    return div;
}
