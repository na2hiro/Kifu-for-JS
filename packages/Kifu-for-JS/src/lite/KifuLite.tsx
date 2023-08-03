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

    return <Zumen zumen={"a"} />;
};

export default observer(KifuLite);
