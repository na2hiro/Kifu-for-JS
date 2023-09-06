/* eslint-disable @typescript-eslint/no-inferrable-types */
import { isTsume, shouldHideKingsHand } from "../../lite/tsumeUtils";
import KifuStore from "./KifuStore";
import { computed, toJS } from "mobx";

export default class TsumeMode {
    private kifuStore: KifuStore;

    constructor(kifuStore: KifuStore) {
        this.kifuStore = kifuStore;
    }

    @computed
    get enabled() {
        const tsumeSpecified = typeof this.kifuStore.options?.tsume !== "undefined";
        if (tsumeSpecified) {
            return !!this.kifuStore.options?.tsume;
        } else {
            return isTsume(this.kifuStore.player);
        }
    }

    @computed
    get hideKingsHand() {
        if (!this.enabled) return false;

        const mustShow =
            typeof this.kifuStore.options?.tsume === "object" && (this.kifuStore.options?.tsume.kingsHand ?? false);

        return !mustShow && shouldHideKingsHand(this.kifuStore.player);
    }

    @computed
    get citation() {
        if (!this.enabled) return null;

        if (!(typeof this.kifuStore.options?.tsume === "object" && (this.kifuStore.options?.tsume.citation ?? false))) {
            return null;
        }

        const { header } = this.kifuStore.player.kifu;
        const author = header["作者"] ? header["作者"] + "作" : undefined;
        const title = header["作品名"] ? "「" + header["作品名"] + "」" : "　";
        const paper = header["発表誌"] || "";
        const date = header["発表年月"] || header["発表日付"] || "";

        if (!author) return null;

        return `${author}${title}${paper}　${date}`;
    }
}
