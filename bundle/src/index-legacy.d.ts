import { autorun, reaction, when } from "mobx";
import KifuStore, { IOptions } from "./common/stores/KifuStore";
export declare const mobx: {
    autorun: typeof autorun;
    when: typeof when;
    reaction: typeof reaction;
};
import { getKifuStore as getKifuStoreFunc, setDefaultOptions as setDefaultOptionsFunc } from "./index";
export declare const getKifuStore: typeof getKifuStoreFunc;
export declare const setDefaultOptions: typeof setDefaultOptionsFunc;
export type ILegacyOptions = {
    mode?: "latest" | "legacy";
} & IOptions;
export declare function loadString(kifu: string, idOrOptions?: string | ILegacyOptions, options?: ILegacyOptions): Promise<KifuStore>;
export declare function load(filePath: string, idOrOptions?: string | ILegacyOptions, options?: ILegacyOptions): Promise<KifuStore>;
