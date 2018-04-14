import {JKFPlayer} from "json-kifu-format";
import {decorate, observable, toJS} from "mobx";

export default class KifuStore {
    public signature = Math.random();
    @observable public reversed: boolean;
    @observable public filename: string;
    // tslint:disable-next-line:variable-name
    @observable private player_: JKFPlayer;

    get player () {
        return this.player_;
    }

    set player (player: JKFPlayer) {
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

    public flip(){
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
}
