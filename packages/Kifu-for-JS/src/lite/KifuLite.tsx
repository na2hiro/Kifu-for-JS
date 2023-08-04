import { observer } from "mobx-react";
import * as React from "react";

import { useEffect, useState } from "react";
import KifuStore from "../stores/KifuStore";
import { Zumen } from "./zumen/Zumen";
import { toJS } from "mobx";
import KifuList from "../KifuList";

export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;
    responsive?: boolean;
}

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

    const areaWidth = 300;
    const areaHeight = 250;

    return (
        <Zumen
            state={kifuStore.player.getState()}
            latestMove={latestMove}
            players={[kifuStore.player.kifu.header["先手"], kifuStore.player.kifu.header["後手"]]}
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
            <foreignObject x={0} y={0} width={100} height={100}>
                <button onClick={() => kifuStore.player.forward()}>next</button>
                <button onClick={() => kifuStore.player.backward()}>previous</button>
            </foreignObject>
        </Zumen>
    );
};

export default observer(KifuLite);
