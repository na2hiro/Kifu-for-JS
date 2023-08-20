import { autorun, reaction, when } from "mobx";
import * as React from "react";
import { render } from "react-dom";
import KifuStoreS from "./common/stores/KifuStore";
import { onDomReady } from "./utils/util";
import KifuLiteComponent from "./lite/KifuLite";
import { JKFPlayer } from "json-kifu-format";

const mobx = { autorun, when, reaction };
import { Shogi } from "shogi.js";

const KifuLite = KifuLiteComponent;
const KifuStore = KifuStoreS;

export { KifuLite, KifuStore, mobx };

type IStatic = {
    last?: "hidden" | [number, number];
};

export interface IOptions {
    kifu?: string;
    src?: string;
    ply?: number;
    forkpointers?: [number, number][];
    static?: IStatic;
}

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
    const kifuStore = new KifuStore();
    const thunk = () => {
        if (options.ply) {
            // TODO: immediately show the target board
            kifuStore.player.goto(
                options.ply,
                options.forkpointers ? options.forkpointers.map(([te, forkIndex]) => ({ te, forkIndex })) : undefined,
            );
        }
    };
    if (options.src) {
        kifuStore.loadFile(options.src).then(thunk);
    } else {
        kifuStore
            .loadKifu(options.kifu.trim())
            .catch(() => {
                if (options.static && options.kifu) {
                    const shogi = new Shogi();
                    shogi.initializeFromSFENString(options.kifu.trim());
                    kifuStore.player = JKFPlayer.fromShogi(shogi);
                }
                kifuStore.errors = [];
            })
            .then(thunk);
    }
    render(
        <KifuLite
            kifuStore={kifuStore}
            static={
                !options.static
                    ? undefined
                    : {
                          last: Array.isArray(options.static?.last)
                              ? { x: options.static.last[0], y: options.static.last[1] }
                              : options.static?.last,
                      }
            }
        />,
        container,
    );

    return kifuStore;
}

if (typeof document !== "undefined") {
    onDomReady(() => {
        // Important to convert to array first, otherwise the NodeList will be modified as we remove the script tags
        const scripts = Array.prototype.slice.call(document.getElementsByTagName("script"));
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.type === "text/kifu") {
                // TODO: ideally svg replaces the script tag, but it's not possible to do that with React
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

function parseOptionsFromAttributes(element: HTMLElement): IOptions {
    const forkpointers = element.dataset.forkpointers ? JSON.parse(element.dataset.forkpointers) : undefined;
    return {
        kifu: element.textContent,
        src: element.dataset.src,
        ply: element.dataset.ply ? parseInt(element.dataset.ply) : undefined,
        forkpointers:
            Array.isArray(forkpointers) && forkpointers.every((p) => Array.isArray(p) && p.length === 2)
                ? forkpointers
                : undefined,
        static: parseStatic(),
    };

    function parseStatic() {
        if (!("static" in element.dataset)) {
            return undefined;
        }
        const last = element.dataset["staticLast"];
        if (last === "hidden") {
            return { last: "hidden" as const };
        }
        const parsed = last ? JSON.parse(last) : undefined;
        if (Array.isArray(parsed) && parsed.length === 2 && parsed.every((n) => typeof n === "number")) {
            return { last: parsed as [number, number] };
        }
        return {};
    }
}
