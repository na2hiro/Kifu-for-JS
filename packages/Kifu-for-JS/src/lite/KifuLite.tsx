import { observer } from "mobx-react";
import * as React from "react";

import { useEffect, useState } from "react";
import KifuStore from "../stores/KifuStore";
import { Zumen } from "./lib/zumen";

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

    return (
        <Zumen
            zumen={
                "後手の持駒：なし\n" +
                "９ ８ ７ ６ ５ ４ ３ ２ １\n" +
                "+---------------------------+\n" +
                "|v香v桂 ・ ・ ・v玉v角v桂v香|一\n" +
                "| ・v飛 ・v銀v金 ・v金 ・ ・|二\n" +
                "|v歩 ・ ・v歩 ・ ・v銀v歩v歩|三\n" +
                "| ・v歩v歩 ・v歩v歩v歩 ・ ・|四\n" +
                "| ・ ・ ・ ・ ・ ・ ・ ・ ・|五\n" +
                "| ・ ・ 歩 歩 歩 ・ 歩 ・ ・|六\n" +
                "| 歩 歩 銀 金 ・ 歩 銀 歩 歩|七\n" +
                "| ・ ・ 金 ・ ・ ・ ・ 飛 ・|八\n" +
                "| 香 桂 角 玉 ・ ・ ・ 桂 香|九\n" +
                "+---------------------------+\n" +
                "先手の持駒：なし\n" +
                "手数＝25 ▲３七銀 まで"
            }
        />
    );
};

export default observer(KifuLite);
