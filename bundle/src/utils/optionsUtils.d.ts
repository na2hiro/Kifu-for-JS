import { IOptions } from "../common/stores/KifuStore";
export declare function parseOptionsFromAttributes(element: HTMLElement): IOptions;
export declare function mergeOptions(options: IOptions, defaultOptions: IOptions): {
    tsume?: import("../common/stores/KifuStore").ITsumeOptions;
    static?: import("../common/stores/KifuStore").IStatic;
    reverse?: import("../common/stores/KifuStore").IReverseOptions;
    kifu?: string;
    src?: string;
    ply?: number;
    forkPointers?: [number, number][];
    maxWidth?: number;
};
