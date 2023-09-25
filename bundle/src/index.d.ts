import { autorun, reaction, when } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import KifuStoreS, { IOptions } from "./common/stores/KifuStore";
declare const mobx: {
    autorun: typeof autorun;
    when: typeof when;
    reaction: typeof reaction;
};
declare const mobxReact: {
    observer: typeof observer;
};
declare const KifuLite: React.FC<React.PropsWithChildren<import("./lite/KifuLite").IProps>>;
declare const KifuStore: typeof KifuStoreS;
export { KifuLite, KifuStore, mobx, mobxReact };
export declare let defaultOptions: IOptions;
export declare function setDefaultOptions(options: IOptions): void;
/**
 * @deprecated Use load instead
 */
export declare function loadString(kifu: string, idOrOptions?: string | IOptions, options?: IOptions): Promise<KifuStoreS>;
export declare function load(options: IOptions, id: string): Promise<KifuStoreS>;
export declare function load(filePath: string, id: string, options?: IOptions): Promise<KifuStoreS>;
export declare function load(filePath: string, options?: IOptions): Promise<KifuStoreS>;
export declare function getKifuStore(element: HTMLElement): Promise<KifuStoreS>;
export declare function recover(): Promise<KifuStoreS[]>;
