import { observer } from "mobx-react";
import * as React from "react";

import { CSSProperties, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import KifuStore, { IOptions, IStatic } from "../common/stores/KifuStore";
import Zumen from "./zumen/Zumen";
import KifuList from "../common/KifuList";

import "../../css/kifuforjs.scss";
import ForkList from "../common/ForkList";
import Comment from "../common/Comment";
import { IPlaceFormat } from "json-kifu-format/src/Formats";
import useHaptics from "./useHaptics";
import Settings from "./SettingsModal";
import UserSetting from "../common/stores/UserSetting";
import SettingsIcon from "./SettingsIcon";

export type IProps = {
    /**
     * A controller object for the kifu.
     */
    kifuStore?: KifuStore;

    /**
     * CSS to be applied to the svg element
     */
    style?: CSSProperties;
} & IOptions;

const areaWidth = 300;
const areaHeight = 250;
const controlHeight = 150;
const controlMarginTop = 4;
const controlMargin = 8;

// TODO: remove this
function getChildrenTextContent(children: ReactNode) {
    if (!children) return children;

    if (typeof children === "string" || typeof children === "number" || typeof children === "boolean") {
        return String(children);
    }
    // Recursively get the text content of the children
    // This is usually not needed, but Docusaurus wraps the children in a <p> tag with mdx
    if (Array.isArray(children)) {
        return children.map(getChildrenTextContent).join("\n\n");
    }
    // This is case of MDX
    if ("props" in children) {
        return getChildrenTextContent(children.props.children);
    }
    return "";
}

const KifuLite: React.FC<PropsWithChildren<IProps>> = ({ kifuStore: givenKifuStore, children, style, ...options }) => {
    const [kifuStore, setKifuStore] = useState<KifuStore>(() => {
        if (givenKifuStore) {
            if (Object.keys(options).length > 0) {
                givenKifuStore.setOptions(options);
            }
            return givenKifuStore;
        }
        const kifu = getChildrenTextContent(children);
        return new KifuStore({
            kifu,
            ...options,
        });
    });

    const userSetting = UserSetting.get();
    useHaptics(kifuStore.player.tesuu, userSetting.hapticFeedback);

    useEffect(() => {
        if (givenKifuStore) {
            setKifuStore(givenKifuStore);
        }
    }, [givenKifuStore]);

    let latestMoveTo = kifuStore.getLatestMoveTo();

    const isStatic = !!kifuStore.staticOptions;
    console.log({ isStatic });

    const svgRef = useRef<SVGSVGElement>(null);
    const svgHeight = areaHeight + (isStatic ? 0 : controlHeight);

    return (
        <Zumen
            state={kifuStore.player.getState()}
            latestMoveTo={latestMoveTo}
            players={[kifuStore.player.kifu.header["先手"], kifuStore.player.kifu.header["後手"]]}
            width={areaWidth}
            height={svgHeight}
            style={{ ...(kifuStore.maxWidth === null ? {} : { maxWidth: kifuStore.maxWidth }), ...style }}
            ref={svgRef}
        >
            {/* TODO: Show indicator for the on-board controls on first interaction */}
            {!isStatic && (
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
                                    style={{ minWidth: "70px", fontSize: "15px" }}
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
                                        style={{ minWidth: "70px", fontSize: "15px", flexGrow: 1 }}
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
            <SettingsIcon width={areaWidth} height={svgHeight} kifuStore={kifuStore} ref={svgRef} />
        </Zumen>
    );
};

export default observer(KifuLite);
