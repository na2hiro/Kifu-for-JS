import { observer } from "mobx-react";
import * as React from "react";

import { CSSProperties, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import KifuList from "../common/KifuList";
import KifuStore, { IOptions } from "../common/stores/KifuStore";
import Zumen from "./zumen/Zumen";

import Comment from "./Comment";
import ForkList from "../common/ForkList";
import UserSetting from "../common/stores/UserSetting";
import { removeIndentation } from "../utils/util";
import SettingsIcon from "./settings/SettingsIcon";
import useHaptics from "./useHaptics";

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
    if (!children) {
        return children;
    }

    if (typeof children === "string" || typeof children === "number" || typeof children === "boolean") {
        return removeIndentation(String(children));
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

const TURNS = [
    { mark: "☗", name: "先手", komaochiName: "下手" },
    { mark: "☖", name: "後手", komaochiName: "上手" },
] as const;

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
    const { player } = kifuStore;
    useHaptics(player.tesuu, userSetting.hapticFeedback);

    useEffect(() => {
        if (givenKifuStore) {
            setKifuStore(givenKifuStore);
        }
    }, [givenKifuStore]);

    const latestMoveTo = kifuStore.getLatestMoveTo();

    const isStatic = !!kifuStore.options?.static;

    const svgRef = useRef<SVGSVGElement>(null);
    const svgHeight = areaHeight + (isStatic ? 0 : controlHeight);

    const players: [string, string] = kifuStore.tsumeMode.enabled
        ? ["持駒", "持駒"]
        : (TURNS.map(({ mark, name, komaochiName }) => {
              if (komaochiName in player.kifu.header) {
                  return mark + (player.kifu.header[komaochiName] || komaochiName);
              }
              return mark + (player.kifu.header[name] || name);
          }) as [string, string]);

    const state = player.getState();

    return (
        <Zumen
            state={state}
            latestMoveTo={latestMoveTo}
            hideKingsHand={kifuStore.tsumeMode.hideKingsHand}
            players={players}
            width={areaWidth}
            height={svgHeight}
            citation={kifuStore.tsumeMode.citation}
            style={{
                ...(kifuStore.maxWidth === null ? {} : { maxWidth: kifuStore.maxWidth }),
                touchAction: "manipulation",
                ...style,
            }}
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
                        onClick={() => player.backward()}
                    />
                    <rect
                        fillOpacity={0}
                        x={areaWidth / 2}
                        y={0}
                        width={areaWidth / 2}
                        height={areaHeight}
                        onClick={() => player.forward()}
                    />
                    <foreignObject
                        x={controlMargin}
                        y={areaHeight + controlMarginTop}
                        width={areaWidth - controlMargin * 2}
                        height={controlHeight - controlMargin - controlMarginTop}
                    >
                        <div style={{ display: "grid", height: "100%", gridAutoRows: "1fr" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    height: "69px",
                                    gap: "1px",
                                }}
                            >
                                <button
                                    onClick={() => player.backward()}
                                    disabled={player.tesuu === 0}
                                    style={{ minWidth: "70px", fontSize: "15px" }}
                                >
                                    ◀
                                </button>
                                <KifuList
                                    player={player}
                                    style={{ fontSize: "x-small" }}
                                    noPositionAbsoluteForSafariBug={true}
                                    initialHeight={67}
                                    hidden={kifuStore.tsumeMode.answerHidden}
                                />
                                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                    {/*TODO: long press to keep moving*/}
                                    <button
                                        onClick={() => player.forward()}
                                        style={{ minWidth: "70px", fontSize: "15px", flexGrow: 1 }}
                                        disabled={player.tesuu === player.currentStream.length - 1}
                                    >
                                        ▶
                                    </button>
                                    <ForkList kifuStore={kifuStore} />
                                </div>
                            </div>
                            <Comment
                                kifuStore={kifuStore}
                                // Make it smaller for Firefox which expands the textarea
                                style={{
                                    backgroundColor: "inherit",
                                    // (Firefox) Use margin instead of gap of the container
                                    marginTop: "1px",
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
