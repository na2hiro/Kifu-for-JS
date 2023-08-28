import { autorun, reaction, when } from "mobx";
import * as React from "react";
import { render } from "react-dom";
import Kifu from "./legacy/Kifu";
import KifuStore, { IOptions } from "./common/stores/KifuStore";
import { onDomReady } from "./utils/util";
import KifuLite from "./lite/KifuLite";
export const mobx = { autorun, when, reaction };

// Important to keep import of index.tsx to have the side effect to scan script tags
import { getKifuStore as getKifuStoreFunc } from "./index";
import { registry } from "./lite/KifuRegistry";

export const getKifuStore = getKifuStoreFunc;

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
    }
    return loadCommon(undefined, kifu, id, options);
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
    }
    return loadCommon(filePath, undefined, id, options);
}

function loadCommon(
    filePath: string | undefined,
    kifu: string | undefined,
    id: string | undefined,
    options: ILegacyOptions | undefined = {},
): Promise<KifuStore> {
    return new Promise((resolve) => {
        if (!id) {
            id = "kifuforjs_" + Math.random().toString(36).slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        onDomReady(() => {
            const container = document.getElementById(id);
            const kifuStore = new KifuStore();
            if (filePath) {
                kifuStore.loadFile(filePath).then(() => {});
            } else {
                kifuStore.loadKifu(kifu).then(() => {});
            }
            console.log({ options });
            const { mode, ...iOptions } = options;
            if (mode === "latest") {
                render(<KifuLite {...iOptions} kifuStore={kifuStore} />, container);
            } else {
                render(<Kifu {...iOptions} kifuStore={kifuStore} />, container);
            }
            registry.register(container!, kifuStore);
            resolve(kifuStore);
        });
    });
}
