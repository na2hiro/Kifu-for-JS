import { observer } from "mobx-react";
import * as React from "react";
import { CSSProperties } from "react";
import KifuStore from "../common/stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
    rows?: number;
    style?: CSSProperties;
}

const Comment: React.FC<IProps> = ({ kifuStore, rows = 10, style }) => {
    const { player } = kifuStore;
    return (
        <textarea
            key={kifuStore.player.tesuu}
            rows={rows}
            className="kifuforjs-comment"
            disabled={true}
            value={kifuStore.errors.join("\n") || player.getComments().join("\n")}
            aria-label="局面コメント"
            style={style}
        />
    );
};
export default observer(Comment);
