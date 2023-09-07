import { JKFPlayer } from "json-kifu-format";
import { IPlaceFormat } from "json-kifu-format/src/Formats";
import { decorate, observable } from "mobx";
import { Shogi } from "shogi.js";
import fetchFile from "../../utils/fetchFile";
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

export type ITsumeOptions =
    | {
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
      }
    | false;

const formatErrorMessage = (kifu: string, error: string) =>
    `棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．
${error}
=== 棋譜 ===
${kifu}`;

export default class KifuStore {
    public signature = Math.random();
    @observable public errors: string[] = [];
    @observable public reversed: boolean;
    @observable public filePath: string;
    /**
     * @deprecated Use `options` instead
     */
    @observable public staticOptions: IStatic;
    @observable public options: IOptions;
    @observable public tsumeMode: TsumeMode;
    @observable public maxWidth: number | null;
    @observable private player_: JKFPlayer;
    private timerAutoload: number;

    constructor(options?: IOptions) {
        this.player = new JKFPlayer({ header: {}, moves: [{}] });
        try {
            this.setOptions(options);
        } catch (e) {
            console.error(e);
        }
    }

    public setOptions(options?: IOptions) {
        this.staticOptions = options?.static;
        this.options = options;
        this.tsumeMode = new TsumeMode(this);

        this.maxWidth = options?.maxWidth === null ? null : options?.maxWidth ?? 400;
        if (options) {
            const onLoad = () => {
                if (options.ply) {
                    this.player.goto(
                        options.ply,
                        options.forkPointers
                            ? options.forkPointers.map(([te, forkIndex]) => ({ te, forkIndex }))
                            : undefined,
                    );
                }
            };
            if (options.src) {
                this.loadFile(options.src)
                    .catch(() => {
                        // ignore and let the comment show error message hanadled inside
                    })
                    .then(onLoad);
            } else if (options.kifu && options.kifu.trim() !== "") {
                try {
                    this.loadKifuSync(options.kifu.trim());
                } catch (e) {
                    if (options.static) {
                        const shogi = new Shogi();
                        try {
                            // Try to recover as SFEN
                            shogi.initializeFromSFENString(options.kifu.trim());
                            this.player = JKFPlayer.fromShogi(shogi);
                            this.errors = [];
                        } catch (_) {
                            // Nvm, throw the original error
                            console.error(e);
                            throw e;
                        }
                    }
                }
                onLoad();
            }
        }
    }

    get player() {
        return this.player_;
    }

    set player(player: JKFPlayer) {
        decorate(player, {
            forkPointers: observable,
            kifu: observable,
            tesuu: observable,
        });
        decorate(player.shogi, {
            board: observable,
            hands: observable,
            turn: observable,
        });
        this.player_ = player;
    }

    public flip() {
        this.reversed = !this.reversed;
    }

    public onInputMove(move) {
        try {
            if (!this.player.inputMove(move)) {
                move.promote = confirm("成りますか？");
                this.player.inputMove(move);
            }
        } catch (e) {
            // ignore
        }
    }

    public loadKifu(kifu: string, fileName?: string): Promise<void> {
        return new Promise((resolve) => {
            this.loadKifuSync(kifu, fileName);
            resolve();
        });
    }

    public loadKifuSync(kifu: string, fileName?: string) {
        this.errors = [];
        try {
            const newPlayer = JKFPlayer.parse(kifu, fileName);
            takeOverState(newPlayer, this.player);
            this.player = newPlayer;
        } catch (syntaxOrSemanticsError) {
            this.errors.push(formatErrorMessage(kifu, syntaxOrSemanticsError));
            throw syntaxOrSemanticsError;
        }
    }

    public loadFile(filePath): Promise<void> {
        this.errors = [];
        this.filePath = filePath;
        return fetchFile(filePath).then(
            (data: string) => {
                try {
                    if (data === null) {
                        // skip
                        return;
                    }
                    const newPlayer = JKFPlayer.parse(data, filePath);
                    takeOverState(newPlayer, this.player);
                    this.player = newPlayer;
                } catch (syntaxOrSemanticsError) {
                    this.errors.push(formatErrorMessage(data, syntaxOrSemanticsError));
                    console.error(syntaxOrSemanticsError);
                    throw syntaxOrSemanticsError;
                }
            },
            (fetchError) => {
                this.errors.push(fetchError);
                throw fetchError;
            },
        );
    }

    public setReloadInterval(interval) {
        if (this.timerAutoload) {
            clearInterval(this.timerAutoload);
        }
        const s = parseInt(interval, 10);
        if (!isNaN(s)) {
            this.timerAutoload = window.setInterval(() => {
                this.loadFile(this.filePath);
            }, s * 1000);
        }
    }

    get hasFork() {
        return this.player.kifu.moves.some((move) => move.forks && move.forks.length > 0);
    }

    public getLatestMoveTo(): IPlaceFormat | undefined {
        if (this.staticOptions?.last === "hidden") {
            return undefined;
        } else if (this.staticOptions?.last) {
            const [x, y] = this.staticOptions.last;
            return { x, y };
        } else {
            let latestMove = this.player.getMove();
            if (!latestMove && this.player.tesuu > 0) {
                latestMove = this.player.getMove(this.player.tesuu - 1);
            }
            return latestMove?.to;
        }
    }
}

/**
 * Take over the current player's state (currently tesuu only) to the new player
 * @param {JKFPlayer} newPlayer
 * @param {JKFPlayer} currentPlayer
 */
function takeOverState(newPlayer: JKFPlayer, currentPlayer?: JKFPlayer) {
    if (currentPlayer.tesuu === 0) {
        return;
    }
    const tesuu = currentPlayer.tesuu === currentPlayer.getMaxTesuu() ? Infinity : currentPlayer.tesuu;
    newPlayer.goto(tesuu);
}
