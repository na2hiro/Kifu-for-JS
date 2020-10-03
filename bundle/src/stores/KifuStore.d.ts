import { JKFPlayer } from "json-kifu-format";
export default class KifuStore {
    signature: number;
    errors: string[];
    reversed: boolean;
    filePath: string;
    private player_;
    private timerAutoload;
    constructor();
    get player(): JKFPlayer;
    set player(player: JKFPlayer);
    flip(): void;
    onInputMove(move: any): void;
    loadKifu(kifu: string, fileName?: string): Promise<void>;
    loadKifuSync(kifu: string, fileName?: string): void;
    loadFile(filePath: any): Promise<void>;
    setReloadInterval(interval: any): void;
    get hasFork(): boolean;
}
