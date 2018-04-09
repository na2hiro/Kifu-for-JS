import {JKFPlayer} from "json-kifu-format";
import {observable} from "mobx";

export default class KifuStore {
    @observable public reversed: boolean;
    @observable public filename: string;
    @observable public player: JKFPlayer;
    public signature = Math.random();

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
