/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

declare var $; // jQuery
declare var jQuery; // jQuery
declare var params; // Flash
declare var so; // Flash
function start() {
    if (window.getSelection && getSelection().toString() !== "") {
        replaceSelected().catch(fail);
    } else {
        replaceAll().catch(fail);
    }

    function fail(e) {
        alert("読込失敗: " + e);
    }

    async function replaceAll() {
        const targetList = [];
        $("applet param[name=KIFU]").each(function() {
            // applet方式
            // homepage2.nifty.com/kakinoki_y/kifujf/example.html
            const $parent = $(this).parent();
            const base = $parent.attr("codebase") || ".";
            const targetId = "kifuforjs_" + makeRandomString();
            const kifuPath = base.replace(/\/$/, "") + "/" + $(this).val();
            $parent.replaceWith("<div id='" + targetId + "'></div>");
            targetList.push({targetId, kifuPath, method: "applet"});
        });
        $("object param[name=FlashVars]").each(function() {
            // object方式 http://homepage2.nifty.com/kakinoki_y/flash/example.html
            const $parent = $(this).parent();
            let kifuPath;
            $(this).val().split("&").map((kv) => {
                const s = kv.split("=");
                if (s[0] === "kifu") { kifuPath = s[1]; }
            });
            if (!kifuPath) { return; }

            const targetId = "kifuforjs_" + makeRandomString();
            $parent.replaceWith("<div id='" + targetId + "'></div>");
            targetList.push({kifuPath, targetId, method: "object"});
        });

        // SWFObject方式
        // ただしFlashが有効であるなどして上記objectで拾われた場合は対応しない
        const $flashcontent = $("#flashcontent");
        const $so = $("#so");
        if (typeof so !== "undefined" && so.variables && so.variables.kifu && $flashcontent.length > 0) {
            // ただしidがflashcontentかつsoオブジェクトが存在する場合のみ)
            // http://homepage2.nifty.com/kakinoki_y/flash/resize.html
            $flashcontent.replaceWith("<div id='flashcontent'></div>");
            targetList.push({targetId: "flashcontent", kifuPath: so.variables.kifu, method: "swo_flashcontent"});
        } else if (typeof params !== "undefined" && params.FlashVars && $so.length > 0) {
            // ただしidがsoかつparamsオブジェクトがある場合
            // http://mainichi.jp/feature/shougi/ohsho/etc/64/150111.html
            let kifuPath;
            params.FlashVars.split("&").forEach((kv) => {
                const s = kv.split("=");
                if (s[0] === "kifu") { kifuPath = s[1]; }
            });
            if (kifuPath) {
                $so.replaceWith("<div id='so'></div>");
                $so.css("visibility", "visible");
                targetList.push({targetId: "so", kifuPath, method: "swo_so"});
            }
        } else {
            // SWFObject方式(script総なめ)
            // http://kiftwi.net/r/YO1ErcFF
            $("script").filter((i, script) => script.textContent.indexOf("SWFObject") >= 0).each((i, script) => {
                const kifuMatch = script.textContent.match(/addVariable.+kifu.+"(.+)"/);
                const idMatch = script.textContent.match(/write.+"(.+)"/);
                if (kifuMatch && idMatch) {
                    targetList.push({kifuPath: kifuMatch[1], targetId: idMatch[1], method: "swo_bruteforce"});
                }
            });
        }

        if (targetList.length === 0) {
            throw new Error("将棋盤が見つかりませんでした");
        }

        const Kifu = await loadKifuForJS();

        targetList.forEach((target) => {
            Kifu.load(target.kifuPath.replace(/\.(z|gz)$/ig, ""), target.targetId);
        });
    }

    async function replaceSelected() {
        const Kifu = await loadKifuForJS();
        const selection = getSelection();
        const id = makeRandomString();
        $("<div id='" + id + "'>").insertAfter($(selection.focusNode));
        Kifu.loadString(selection.toString(), id);
    }
}

function makeRandomString() {
    return Math.random().toString(36).slice(2);
}

let cnt = 0;
if (typeof $ === "undefined" || !$.fn || !$.fn.jquery) {
    cnt++;
    const scr = document.createElement("script");
    scr.src = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
    scr.charset = "utf-8";
    scr.onload = () => {
        $ = jQuery;
        if (--cnt === 0) { start(); }
    };
    document.body.appendChild(scr);
}
if (cnt === 0) { start(); } // いずれも読み込み済み

async function loadKifuForJS(): Promise<{ load: any; loadString: any; }> {
    const Kifu = (await import(/* webpackChunkName: "KifuInBookmarklet" */"./index"));
    Kifu.settings.ImageDirectoryPath = "https://na2hiro.github.io/Kifu-for-JS/images";
    return Kifu;
}
