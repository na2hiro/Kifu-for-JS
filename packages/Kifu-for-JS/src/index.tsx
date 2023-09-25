import { autorun, reaction, when } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { render } from "react-dom";
import KifuStoreS, { IOptions } from "./common/stores/KifuStore";
import KifuLiteComponent from "./lite/KifuLite";
import { registry } from "./lite/KifuRegistry";
import { onDomReady } from "./utils/util";
import { searchForRecovery } from "./utils/recover";
import { mergeOptions, parseOptionsFromAttributes } from "./utils/optionsUtils";

const mobx = { autorun, when, reaction };
const mobxReact = { observer };
const KifuLite = KifuLiteComponent;
const KifuStore = KifuStoreS;

export { KifuLite, KifuStore, mobx, mobxReact };

export let defaultOptions: IOptions = {};
export function setDefaultOptions(options: IOptions) {
    defaultOptions = options;
}

/**
 * @deprecated Use load instead
 */
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

export function load(options: IOptions, id: string): Promise<KifuStoreS>;
// Below are compatibility with v4 or less
export function load(filePath: string, id: string, options?: IOptions): Promise<KifuStoreS>;
export function load(filePath: string, options?: IOptions): Promise<KifuStoreS>;
export function load(
    filePathOrOptions: string | IOptions,
    idOrOptions?: string | IOptions,
    options?: IOptions,
): Promise<KifuStoreS> {
    let id: string | undefined;
    if (typeof filePathOrOptions === "string") {
        if (typeof idOrOptions === "object") {
            options = idOrOptions;
            id = undefined;
        } else {
            id = idOrOptions;
            options = options || {};
        }
        options.src = filePathOrOptions;
    } else {
        options = filePathOrOptions;
        id = idOrOptions as string;
    }
    return loadCommon(id, options);
}

/**
 * Load a kifu into a given container, or create a new container if id is not specified, when DOM is ready.
 */
function loadCommon(id: string | undefined, options: IOptions | undefined): Promise<KifuStoreS> {
    return new Promise((resolve) => {
        if (!id) {
            id = "kifuforjs_" + Math.random().toString(36).slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        onDomReady(() => {
            const container = document.getElementById(id);
            if (!container) {
                throw new Error(`Container ${id} not found`);
            }
            const kifuStore = loadSingle(options, container);
            registry.register(container, kifuStore);
            resolve(kifuStore);
        });
    });
}

/**
 * Load a kifu into a container.
 */
function loadSingle(options: IOptions, container: HTMLElement) {
    const kifuStore = new KifuStore(mergeOptions(options, defaultOptions));
    render(<KifuLite kifuStore={kifuStore} />, container);

    return kifuStore;
}

export function getKifuStore(element: HTMLElement) {
    return registry.getKifuStore(element);
}

// Load kifu from script tags
if (typeof document !== "undefined") {
    onDomReady(() => {
        for (const script of Array.from(document.getElementsByTagName("script"))) {
            if (script.type === "text/kifu" && !script.dataset.loaded) {
                // ideally svg is directly injected, but it's not possible to do that with React
                // Render svg inside ins element here.
                try {
                    const container = document.createElement("ins");
                    container.style.textDecorationLine = "none"; // remove underline in Safari
                    script.insertAdjacentElement("afterend", container);
                    script.dataset.loaded = "true";

                    const options = parseOptionsFromAttributes(script);
                    const kifuStore = loadSingle(options, container);
                    registry.register(script, kifuStore);
                } catch (e) {
                    console.error(e, script);
                }
            }
        }
    });
}

export async function recover() {
    const targets = await searchForRecovery();
    return Promise.all(targets.map((target) => load({ src: target.kifuPath }, target.targetId)));
}
