import { autorun, reaction, when } from "mobx";
import * as React from "react";
import { render } from "react-dom";
import Kifu from "./legacy/Kifu";
import KifuStore from "./common/stores/KifuStore";
import { onDomReady } from "./utils/util";
import KifuLite from "./lite/KifuLite";
export const mobx = { autorun, when, reaction };

export interface IOptions {
    responsive?: boolean;
    mode?: "lite" | "normal";
}

export function loadString(kifu: string, idOrOptions?: string | IOptions, options?: IOptions): Promise<KifuStore> {
    let id: string | undefined;
    if (typeof idOrOptions === "object") {
        options = idOrOptions;
        id = undefined;
    } else {
        id = idOrOptions;
    }
    return loadCommon(undefined, kifu, id, options);
}

export function load(filePath: string, idOrOptions?: string | IOptions, options?: IOptions): Promise<KifuStore> {
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
    options: IOptions | undefined,
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
            if (options?.mode === "lite") {
                render(<KifuLite {...options} kifuStore={kifuStore} />, container);
            } else {
                render(<Kifu {...options} kifuStore={kifuStore} />, container);
            }
            resolve(kifuStore);
        });
    });
}
