import {JKFPlayer} from "json-kifu-format";
import {decorate, observable, toJS} from "mobx";
import {fetchFile} from "../util";

const FORMAT_ERROR_MESSAGE =
    "棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n";

export default class KifuStore {

    public signature = Math.random();
    @observable public errors: string[] = [];
    @observable public reversed: boolean;
    @observable public filePath: string;
    // tslint:disable-next-line:variable-name
    @observable private player_: JKFPlayer;
    private timerAutoload: number;

    constructor() {
        this.player = new JKFPlayer({header: {}, moves: [{}]});
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
        (window as any).player = player;
        (window as any).toJS = toJS;
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

    public loadKifu(kifu: string, fileName?: string) {
        this.errors = [];
        try {
            const newPlayer = JKFPlayer.parse(kifu, fileName);
            takeOverState(newPlayer, this.player);
            this.player = newPlayer;
        } catch (e) {
            this.errors.push(FORMAT_ERROR_MESSAGE + kifu);
        }
    }

    public loadFile(filePath) {
        this.errors = [];
        this.filePath = filePath;
        fetchFile(filePath)
            .catch((error) => this.errors.push(error))
            .then((data: string) => {
                try {
                    if (data === null) {
                        // skip
                        return;
                    }
                    const newPlayer = JKFPlayer.parse(data, filePath);
                    takeOverState(newPlayer, this.player);
                    this.player = newPlayer;
                } catch (e) {
                    this.errors.push(FORMAT_ERROR_MESSAGE + data);
                    throw e;
                }
            });
    }

    public setReloadInterval(interval) {
        if (this.timerAutoload) {
            window.clearInterval(this.timerAutoload);
        }
        const s = parseInt(interval, 10);
        if (!isNaN(s)) {
            this.timerAutoload = window.setInterval(() => {
                this.loadFile(this.filePath);
            }, s * 1000);
        }
    }
}

/**
 * Take over the current player's state (currently tesuu only) to the new player
 * @param {JKFPlayer} newPlayer
 * @param {JKFPlayer} currentPlayer
 */
function takeOverState(newPlayer: JKFPlayer, currentPlayer?: JKFPlayer) {
    if (currentPlayer.tesuu === 0){
        return;
    }
    const tesuu = currentPlayer.tesuu === currentPlayer.getMaxTesuu() ? Infinity : currentPlayer.tesuu;
    newPlayer.goto(tesuu);
}
