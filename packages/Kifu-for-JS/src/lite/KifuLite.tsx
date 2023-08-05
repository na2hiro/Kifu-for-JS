import { observer } from "mobx-react";
import * as React from "react";

import { useEffect, useState } from "react";
import KifuStore from "../stores/KifuStore";
import { Zumen } from "./zumen/Zumen";
import KifuList from "../KifuList";

import "../../css/kifuforjs.scss";
import ForkList from "../ForkList";
import Comment from "../Comment";

export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;
    responsive?: boolean;
}

const areaWidth = 300;
const areaHeight = 250;
const controlHeight = 150;
const controlMargin = 5;

const KifuLite: React.FC<IProps> = ({ kifuStore: givenKifuStore, filePath, kifu }) => {
    const [kifuStore, _] = useState<KifuStore>(() => givenKifuStore || new KifuStore());

    useEffect(() => {
        if (filePath) {
            kifuStore.loadFile(filePath);
        } else {
            kifuStore.loadKifu(kifu);
        }
    }, [filePath, kifu]);

    let latestMove = kifuStore.player.getMove();
    if (!latestMove && kifuStore.player.tesuu > 0) {
        latestMove = kifuStore.player.getMove(kifuStore.player.tesuu - 1);
    }

    return (
        <Zumen
            state={kifuStore.player.getState()}
            latestMove={latestMove}
            players={[kifuStore.player.kifu.header["先手"], kifuStore.player.kifu.header["後手"]]}
            width={areaWidth}
            height={areaHeight + controlHeight}
        >
            {/* TODO: Show indicator for the on-board controls on first interaction */}
            <rect
                fillOpacity={0}
                x={0}
                y={0}
                width={areaWidth / 2}
                height={areaHeight}
                onClick={() => kifuStore.player.backward()}
            ></rect>
            <rect
                fillOpacity={0}
                x={areaWidth / 2}
                y={0}
                width={areaWidth / 2}
                height={areaHeight}
                onClick={() => kifuStore.player.forward()}
            ></rect>
            <foreignObject
                x={controlMargin}
                y={areaHeight + controlMargin}
                width={areaWidth - controlMargin * 2}
                height={controlHeight - controlMargin * 2}
            >
                <div style={{ display: "grid", height: "100%", gap: "1px", gridAutoRows: "1fr" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", height: "100%", gap: "1px" }}>
                        <button
                            onClick={() => kifuStore.player.backward()}
                            disabled={kifuStore.player.tesuu === 0}
                            style={{ minWidth: "70px", fontSize: "10px" }}
                        >
                            ◀
                        </button>
                        {/*TODO: kifu list bug when zoomed*/}
                        <KifuList player={kifuStore.player} isPortrait={false} style={{ fontSize: "small" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            {/*TODO: long press to keep moving*/}
                            <button
                                onClick={() => kifuStore.player.forward()}
                                style={{ minWidth: "70px", fontSize: "10px", flexGrow: 1 }}
                                disabled={kifuStore.player.tesuu === kifuStore.player.kifu.moves.length - 1}
                            >
                                ▶
                            </button>
                            <ForkList kifuStore={kifuStore} />
                        </div>
                    </div>
                    <Comment kifuStore={kifuStore} rows={5} style={{ fontSize: "small", resize: "none" }} />
                </div>
            </foreignObject>
        </Zumen>
    );
};

export default observer(KifuLite);
