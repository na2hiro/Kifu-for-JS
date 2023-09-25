import { autorun, reaction, when } from "mobx";
import * as React from "react";
import { render } from "react-dom";
import KifuStore, { IOptions } from "./common/stores/KifuStore";
import Kifu from "./legacy/Kifu";
import KifuLite from "./lite/KifuLite";
import { onDomReady } from "./utils/util";
export const mobx = { autorun, when, reaction };

// Important to keep import of index.tsx to have the side effect to scan script tags
import { getKifuStore as getKifuStoreFunc, setDefaultOptions as setDefaultOptionsFunc, defaultOptions } from "./index";
import { registry } from "./lite/KifuRegistry";
import { mergeOptions } from "./utils/optionsUtils";

export const getKifuStore = getKifuStoreFunc;
export const setDefaultOptions = setDefaultOptionsFunc;

export type ILegacyOptions = {
    mode?: "latest" | "legacy";
} & IOptions;

export function loadString(
    kifu: string,
    idOrOptions?: string | ILegacyOptions,
    options?: ILegacyOptions,
): Promise<KifuStore> {
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

export function load(
    filePath: string,
    idOrOptions?: string | ILegacyOptions,
    options?: ILegacyOptions,
): Promise<KifuStore> {
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

function loadCommon(id: string | undefined, options: ILegacyOptions): Promise<KifuStore> {
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
            const { mode, ...iOptions } = options;
            const kifuStore = new KifuStore(mergeOptions(iOptions, defaultOptions));
            if (mode === "latest") {
                render(<KifuLite kifuStore={kifuStore} />, container);
            } else {
                render(<Kifu kifuStore={kifuStore} />, container);
            }
            registry.register(container, kifuStore);
            resolve(kifuStore);
        });
    });
}
