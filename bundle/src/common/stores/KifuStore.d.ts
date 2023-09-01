import { JKFPlayer } from "json-kifu-format";
import { IPlaceFormat } from "json-kifu-format/src/Formats";
export interface IOptions {
    kifu?: string;
    src?: string;
    ply?: number;
    forkPointers?: Array<[number, number]>;
    static?: IStatic;
    maxWidth?: number | null;
}
export interface IStatic {
    last?: "hidden" | [number, number];
}
export default class KifuStore {
    signature: number;
    errors: string[];
    reversed: boolean;
    filePath: string;
    staticOptions: IStatic;
    maxWidth: number | null;
    private player_;
    private timerAutoload;
    constructor(options?: IOptions);
    setOptions(options?: IOptions): void;
    get player(): JKFPlayer;
    set player(player: JKFPlayer);
    flip(): void;
    onInputMove(move: any): void;
    loadKifu(kifu: string, fileName?: string): Promise<void>;
    loadKifuSync(kifu: string, fileName?: string): void;
    loadFile(filePath: any): Promise<void>;
    setReloadInterval(interval: any): void;
    get hasFork(): boolean;
    getLatestMoveTo(): IPlaceFormat | undefined;
}
