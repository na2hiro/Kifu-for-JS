import KifuStore from "./KifuStore";
import { computed, observable } from "mobx";
import { TURNS } from "../../lite/utils";

export default class ReverseMode {
    private kifuStore: KifuStore;
    @observable public isReversed = false;

    constructor(kifuStore: KifuStore) {
        this.kifuStore = kifuStore;
        this.isReversed = !!kifuStore.options.reverse && !kifuStore.options.reverse.name;
    }

    @computed
    get playerNames() {
        const { header } = this.kifuStore.player.kifu;
        return [
            header[TURNS[0].komaochiName] || header[TURNS[0].name] || "",
            header[TURNS[1].komaochiName] || header[TURNS[1].name] || "",
        ];
    }

    reverse() {
        this.isReversed = !this.isReversed;
    }

    runAutoReverse() {
        if (this.kifuStore.options.reverse?.name) {
            const [p0, p1] = this.playerNames;
            this.isReversed = shouldReverse(p0, p1, this.kifuStore.options.reverse.name);
        }
    }
}

function shouldReverse(player0: string, player1: string, name: string) {
    if (player1.indexOf(name) < 0) {
        return false;
    }
    if (player0.indexOf(name) < 0) {
        return true;
    }
    return player1.length < player0.length;
}
