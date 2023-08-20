import { observer } from "mobx-react";
import * as React from "react";

import { useEffect, useState } from "react";
import KifuStore from "../common/stores/KifuStore";
import Zumen from "./zumen/Zumen";
import KifuList from "../common/KifuList";

import "../../css/kifuforjs.scss";
import ForkList from "../common/ForkList";
import Comment from "../common/Comment";
import { IPlaceFormat } from "json-kifu-format/src/Formats";

export interface IProps {
    kifuStore?: KifuStore;
    static?: {
        last?: "hidden" | { x: number; y: number };
    };
}

const areaWidth = 300;
const areaHeight = 250;
const controlHeight = 150;
const controlMarginTop = 4;
const controlMargin = 8;

const KifuLite: React.FC<IProps> = ({ kifuStore: givenKifuStore, static: staticc }) => {
    const [kifuStore, setKifuStore] = useState<KifuStore>(() => givenKifuStore || new KifuStore());

    useEffect(() => {
        setKifuStore(givenKifuStore);
    }, [givenKifuStore]);

    let latestMoveTo: IPlaceFormat;
    if (staticc?.last === "hidden") {
        latestMoveTo = undefined;
    } else if (staticc?.last) {
        latestMoveTo = staticc?.last;
    } else {
        let latestMove = kifuStore.player.getMove();
        if (!latestMove && kifuStore.player.tesuu > 0) {
            latestMove = kifuStore.player.getMove(kifuStore.player.tesuu - 1);
        }
        latestMoveTo = latestMove?.to;
    }

    return (
        <Zumen
            state={kifuStore.player.getState()}
            latestMoveTo={latestMoveTo}
            players={[kifuStore.player.kifu.header["先手"], kifuStore.player.kifu.header["後手"]]}
            width={areaWidth}
            height={areaHeight + (staticc ? 0 : controlHeight)}
        >
            {/* TODO: Show indicator for the on-board controls on first interaction */}
            {!staticc && (
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
                                        disabled={kifuStore.player.tesuu === kifuStore.player.kifu.moves.length - 1}
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
