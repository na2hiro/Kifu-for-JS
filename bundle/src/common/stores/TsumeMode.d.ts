import KifuStore from "./KifuStore";
export default class TsumeMode {
    private kifuStore;
    private dirty;
    constructor(kifuStore: KifuStore);
    get enabled(): boolean;
    get hideKingsHand(): boolean;
    get citation(): string;
    get answerHidden(): boolean;
}
