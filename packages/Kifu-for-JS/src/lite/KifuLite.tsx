import { observer } from "mobx-react";
import * as React from "react";

import { useEffect, useState } from "react";
import KifuStore from "../stores/KifuStore";
import { Zumen } from "./zumen/Zumen";
import KifuList from "../KifuList";

import "../../css/kifuforjs.scss";
import ForkList from "../ForkList";

export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;
    responsive?: boolean;
}

const areaWidth = 300;
const areaHeight = 250;
const controlHeight = 100;
const PORTRAIT_VIEW_QUERY = "(max-aspect-ratio: 2/3), (max-width: 570px)";

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
            <foreignObject x={0} y={areaHeight} width={areaWidth} height={controlHeight}>
                <div style={{ display: "flex", justifyContent: "space-between", height: "100%" }}>
                    <button onClick={() => kifuStore.player.backward()} style={{ minWidth: "70px", fontSize: "25px" }}>
                        ←
                    </button>
                    {/*TODO: kifu list bug when zoomed*/}
                    <KifuList player={kifuStore.player} isPortrait={false} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <button
                            onClick={() => kifuStore.player.forward()}
                            style={{ minWidth: "70px", fontSize: "25px", flexGrow: 1 }}
                        >
                            →
                        </button>
                        <ForkList kifuStore={kifuStore} />
                    </div>
                </div>
            </foreignObject>
        </Zumen>
    );
};

export default observer(KifuLite);
