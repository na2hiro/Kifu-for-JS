import KifuStore from "./KifuStore";
export default class ReverseMode {
    private kifuStore;
    isReversed: boolean;
    constructor(kifuStore: KifuStore);
    get playerNames(): string[];
    reverse(): void;
    runAutoReverse(): void;
}
