import { observer } from "mobx-react";
import * as React from "react";
import { CSSProperties } from "react";
import KifuStore from "../common/stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
    style?: CSSProperties;
}

const Comment: React.FC<IProps> = ({ kifuStore, style }) => {
    const { player } = kifuStore;
    return (
        <div
            key={kifuStore.player.tesuu}
            aria-label="局面コメント"
            style={{
                userSelect: "text",
                overflowY: "auto",
                padding: "2px",
                fontSize: "12px",
                fontFamily: "sans-serif",
                border: "rgba(118, 118, 118, 0.3) 1px solid",
                borderRadius: "2px",
                ...style,
            }}
        >
            {kifuStore.errors.join("\n") || player.getComments().join("\n")}
        </div>
    );
};
export default observer(Comment);
