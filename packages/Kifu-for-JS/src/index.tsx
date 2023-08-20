import { autorun, reaction, when } from "mobx";
import * as React from "react";
import { render } from "react-dom";
import KifuStoreS, { IOptions } from "./common/stores/KifuStore";
import { onDomReady } from "./utils/util";
import KifuLiteComponent from "./lite/KifuLite";
import { parseOptionsFromAttributes } from "./common/stores/setupKifuStore";

const mobx = { autorun, when, reaction };
const KifuLite = KifuLiteComponent;
const KifuStore = KifuStoreS;

export { KifuLite, KifuStore, mobx };

export function loadString(kifu: string, idOrOptions?: string | IOptions, options?: IOptions): Promise<KifuStoreS> {
    let id: string | undefined;
    if (typeof idOrOptions === "object") {
        options = idOrOptions;
        id = undefined;
    } else {
        id = idOrOptions;
        options = options || {};
    }
    options.kifu = kifu;
    return loadCommon(id, options);
}

export function load(filePath: string, idOrOptions?: string | IOptions, options?: IOptions): Promise<KifuStoreS> {
    let id: string | undefined;
    if (typeof idOrOptions === "object") {
        options = idOrOptions;
        id = undefined;
    } else {
        id = idOrOptions;
        options = options || {};
    }
    options.src = filePath;
    return loadCommon(id, options);
}

function loadCommon(id: string | undefined, options: IOptions | undefined): Promise<KifuStoreS> {
    return new Promise((resolve) => {
        if (!id) {
            id = "kifuforjs_" + Math.random().toString(36).slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        onDomReady(() => {
            const container = document.getElementById(id);
            const kifuStore = loadSingle(options, container!);
            resolve(kifuStore);
        });
    });
}

function loadSingle(options: IOptions, container: HTMLElement) {
    const kifuStore = new KifuStore(options);
    render(<KifuLite kifuStore={kifuStore} />, container);

    return kifuStore;
}

if (typeof document !== "undefined") {
    onDomReady(() => {
        // Important to convert to array first, otherwise the NodeList will be modified as we remove the script tags
        const scripts = Array.prototype.slice.call(document.getElementsByTagName("script"));
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.type === "text/kifu") {
                // ideally svg replaces the script tag, but it's not possible to do that with React
                const container = document.createElement("ins");
                if (script.className) {
                    container.className = script.className;
                }
                if (script.getAttribute("style")) {
                    container.setAttribute("style", script.getAttribute("style"));
                }
                script.replaceWith(container);

                const options = parseOptionsFromAttributes(script);
                loadSingle(options, container);
            }
        }
    });
}
