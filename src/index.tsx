import { autorun, reaction, when } from "mobx";
import * as React from "react";
import { render } from "react-dom";
import Kifu from "./Kifu";
import KifuStore from "./stores/KifuStore";
import { onDomReady } from "./utils/util";
export const mobx = { autorun, when, reaction };

export type Options = {
    responsive?: boolean;
}

export function loadString(kifu: string, idOrOptions?: string | Options, options?: Options): Promise<KifuStore> {
    let id: string | undefined;
    if (typeof idOrOptions === "object") {
        options = idOrOptions;
        id = undefined;
    } else {
        id = idOrOptions;
    }
    return loadCommon(undefined, kifu, id, options);
}

export function load(filePath: string, idOrOptions?: string | Options, options?: Options): Promise<KifuStore> {
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
    options: Options | undefined): Promise<KifuStore> {
    return new Promise((resolve) => {
        if (!id) {
            id =
                "kifuforjs_" +
                Math.random()
                    .toString(36)
                    .slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        onDomReady(() => {
            const container = document.getElementById(id);
            const kifuStore = new KifuStore();
            render(<Kifu {...options} kifuStore={kifuStore} kifu={kifu} filePath={filePath} />, container);
            resolve(kifuStore);
        });
    });
}
