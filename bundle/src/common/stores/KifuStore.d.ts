import { JKFPlayer } from "json-kifu-format";
import { IPlaceFormat } from "json-kifu-format/src/Formats";
import TsumeMode from "./TsumeMode";
/**
 * Options for displaying Kifu. See https://kifu-for-js.81.la/docs/options for details.
 */
export interface IOptions {
    /**
     * Kifu string to be loaded
     */
    kifu?: string;
    /**
     * URL to fetch Kifu string from
     */
    src?: string;
    /**
     * Ply to start from
     */
    ply?: number;
    /**
     * Array of pairs of [ply, forkIndex] to start from in case of forked Kifu
     */
    forkPointers?: Array<[number, number]>;
    /**
     * Options for image mode
     */
    static?: IStatic;
    /**
     * Options for tsume shogi mode
     */
    tsume?: ITsumeOptions;
    /**
     * Maximum width of the board in pixels
     */
    maxWidth?: number | null;
}
export interface IStatic {
    /**
     * Specify the last move to show. If "hidden", the last move is hidden.
     * Without this options, the last move is shown.
     */
    last?: "hidden" | [number, number];
}
export type ITsumeOptions = {
    /**
     * Show hand of king's side even though it looks redundant
     * Default: false, meaning it omits hand display if king has all the rest of pieces (excluding king) in the hand
     */
    kingsHand?: boolean;
    /**
     * Show citation for the problem
     * Default: false
     */
    citation?: boolean;
    /**
     * Hide the answer until the first replay is made
     */
    hideAnswer?: boolean;
} | false;
export default class KifuStore {
    signature: number;
    errors: string[];
    reversed: boolean;
    filePath: string;
    /**
     * @deprecated Use `options` instead
     */
    staticOptions: IStatic;
    options: IOptions;
    tsumeMode: TsumeMode;
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
