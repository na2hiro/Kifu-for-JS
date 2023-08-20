import { observer } from "mobx-react";
import * as React from "react";

import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import KifuStore, { IOptions, IStatic } from "../common/stores/KifuStore";
import Zumen from "./zumen/Zumen";
import KifuList from "../common/KifuList";

import "../../css/kifuforjs.scss";
import ForkList from "../common/ForkList";
import Comment from "../common/Comment";
import { IPlaceFormat } from "json-kifu-format/src/Formats";

export type IProps = {
    /**
     * A controller object for the kifu.
     */
    kifuStore?: KifuStore;
} & IOptions;

const areaWidth = 300;
const areaHeight = 250;
const controlHeight = 150;
const controlMarginTop = 4;
const controlMargin = 8;

function getChildrenTextContent(children: ReactNode) {
    if (!children) return children;

    if (typeof children === "string") {
        return children;
    }
    // Recursively get the text content of the children
    // This is usually not needed, but Docusaurus wraps the children in a <p> tag with mdx
    if (Array.isArray(children)) {
        return children.map(getChildrenTextContent).join("\n");
    }
    return "";
}

const KifuLite: React.FC<PropsWithChildren<IProps>> = ({ kifuStore: givenKifuStore, children, ...options }) => {
    const [kifuStore, setKifuStore] = useState<KifuStore>(() => {
        const kifu = getChildrenTextContent(children);
        return (
            givenKifuStore ||
            new KifuStore({
                kifu,
                ...options,
            })
        );
    });

    useEffect(() => {
        if (givenKifuStore) {
            setKifuStore(givenKifuStore);
        }
    }, [givenKifuStore]);

    let latestMoveTo = kifuStore.getLatestMoveTo();

    return (
        <Zumen
            state={kifuStore.player.getState()}
            latestMoveTo={latestMoveTo}
            players={[kifuStore.player.kifu.header["先手"], kifuStore.player.kifu.header["後手"]]}
            width={areaWidth}
            height={areaHeight + (options.static ? 0 : controlHeight)}
        >
            {/* TODO: Show indicator for the on-board controls on first interaction */}
            {!options.static && (
                <>
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
                        y={areaHeight + controlMarginTop}
                        width={areaWidth - controlMargin * 2}
                        height={controlHeight - controlMargin - controlMarginTop}
                    >
                        <div style={{ display: "grid", height: "100%", gap: "1px", gridAutoRows: "1fr" }}>
                            <div
                                style={{ display: "flex", justifyContent: "space-between", height: "100%", gap: "1px" }}
                            >
                                <button
                                    onClick={() => kifuStore.player.backward()}
                                    disabled={kifuStore.player.tesuu === 0}
                                    style={{ minWidth: "70px", fontSize: "10px" }}
                                >
                                    ◀
                                </button>
                                <KifuList
                                    player={kifuStore.player}
                                    isPortrait={false}
                                    style={{ fontSize: "x-small" }}
                                />
                                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                    {/*TODO: long press to keep moving*/}
                                    <button
                                        onClick={() => kifuStore.player.forward()}
                                        style={{ minWidth: "70px", fontSize: "10px", flexGrow: 1 }}
                                        disabled={kifuStore.player.tesuu === kifuStore.player.currentStream.length - 1}
                                    >
                                        ▶
                                    </button>
                                    <ForkList kifuStore={kifuStore} />
                                </div>
                            </div>
                            <Comment
                                kifuStore={kifuStore}
                                rows={5}
                                style={{
                                    fontSize: "small",
                                    resize: "none",
                                    backgroundColor: "inherit",
                                }}
                            />
                        </div>
                    </foreignObject>
                </>
            )}
        </Zumen>
    );
};

export default observer(KifuLite);
