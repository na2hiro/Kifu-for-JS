/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import KifuStore from "./stores/KifuStore";

declare var $; // jQuery
declare var jQuery; // jQuery
declare var params; // Flash
declare var so; // Flash

async function start(): Promise<KifuStore[]> {
    if (window.getSelection && getSelection().toString() !== "") {
        return replaceSelected().catch(fail);
    } else {
        return replaceAll().catch(fail);
    }

    function fail(e): Promise<KifuStore[]> {
        window.alert("読込失敗: " + e);
        throw e;
    }

    async function replaceAll(): Promise<KifuStore[]> {
        const targetList = [];
        $("applet param[name=KIFU]").each(function() {
            // applet方式
            // http://kakinoki.o.oo7.jp/kifujf/example.html
            const $parent = $(this).parent();
            const base = $parent.attr("codebase") || ".";
            const targetId = makeRandomId();
            const kifuPath = base.replace(/\/$/, "") + "/" + $(this).val();
            $parent.replaceWith("<div id='" + targetId + "'></div>");
            targetList.push({ targetId, kifuPath, method: "applet" });
        });
        $("object param[name=FlashVars]").each(function() {
            // object方式 http://kakinoki.o.oo7.jp/flash/example.html
            const $parent = $(this).parent();
            let kifuPath;
            $(this)
                .val()
                .split("&")
                .map((kv) => {
                    const s = kv.split("=");
                    if (s[0] === "kifu") {
                        kifuPath = s[1];
                    }
                });
            if (!kifuPath) {
                return;
            }

            const targetId = makeRandomId();
            $parent.replaceWith("<div id='" + targetId + "'></div>");
            targetList.push({ kifuPath, targetId, method: "object" });
        });

        // SWFObject方式
        // ただしFlashが有効であるなどして上記objectで拾われた場合は対応しない
        const $flashcontent = $("#flashcontent");
        const $so = $("#so");
        if (typeof so !== "undefined" && so.variables && so.variables.kifu && $flashcontent.length > 0) {
            // ただしidがflashcontentかつsoオブジェクトが存在する場合のみ)
            // http://kakinoki.o.oo7.jp/flash/resize.html
            $flashcontent.replaceWith("<div id='flashcontent'></div>");
            targetList.push({ targetId: "flashcontent", kifuPath: so.variables.kifu, method: "swo_flashcontent" });
        } else if (typeof params !== "undefined" && params.FlashVars && $so.length > 0) {
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
                $so.replaceWith("<div id='so'></div>");
                $so.css("visibility", "visible");
                targetList.push({ targetId: "so", kifuPath, method: "swo_so" });
            }
        } else {
            // SWFObject方式(script総なめ)
            // http://kiftwi.net/r/YO1ErcFF
            $("script")
                .filter((i, script) => script.textContent.indexOf("SWFObject") >= 0)
                .each((i, script) => {
                    const kifuMatch = script.textContent.match(/addVariable.+kifu.+"(.+)"/);
                    const idMatch = script.textContent.match(/write.+"(.+)"/);
                    if (kifuMatch && idMatch) {
                        targetList.push({ kifuPath: kifuMatch[1], targetId: idMatch[1], method: "swo_bruteforce" });
                    }
                });
        }

        if (targetList.length === 0) {
            return Promise.reject("将棋盤が見つかりませんでした");
        }

        const Kifu = await loadKifuForJS();

        return Promise.all(targetList.map((target) => {
            return Kifu.load(target.kifuPath.replace(/\.(z|gz)$/gi, ""), target.targetId)
        }));
    }

    async function replaceSelected(): Promise<KifuStore[]> {
        const Kifu = await loadKifuForJS();
        const selection = getSelection();
        const id = makeRandomId();
        $("<div id='" + id + "'>").insertAfter($(selection.focusNode));
        return Promise.all([Kifu.loadString(selection.toString(), id)]);
    }
}

function makeRandomId() {
    return "kifuforjs_" + Math.random()
        .toString(36)
        .slice(2);
}

let promise = Promise.resolve();

if (typeof $ === "undefined" || !$.fn || !$.fn.jquery) {
    promise = promise.then(() => new Promise<void>((resolve => {
        const scr = document.createElement("script");
        scr.src = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
        scr.charset = "utf-8";
        scr.onload = () => {
            $ = jQuery;
            resolve();
        };
        document.body.appendChild(scr);
    })));
}

module.exports = promise.then(start);

async function loadKifuForJS(): Promise<{ load: any; loadString: any }> {
    return await import(/* webpackChunkName: "KifuInBookmarklet" */ "./index");
}
