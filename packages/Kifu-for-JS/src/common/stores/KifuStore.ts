import { JKFPlayer } from "json-kifu-format";
import { IPlaceFormat } from "json-kifu-format/src/Formats";
import { decorate, observable } from "mobx";
import { Shogi } from "shogi.js";
import fetchFile from "../../utils/fetchFile";

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

const formatErrorMessage = (kifu, error) =>
    `棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．
${error}
=== 棋譜 ===
${kifu}`;

export default class KifuStore {
    public signature = Math.random();
    @observable public errors: string[] = [];
    @observable public reversed: boolean;
    @observable public filePath: string;
    @observable public staticOptions: IStatic;
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
        this.maxWidth = options?.maxWidth === null ? null : options?.maxWidth ?? 400;
        if (options) {
            const initializePly = () => {
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
                    .then(initializePly);
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
                initializePly();
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
