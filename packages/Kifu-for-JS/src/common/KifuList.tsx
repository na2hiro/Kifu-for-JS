import { JKFPlayer } from "json-kifu-format";
import { observer } from "mobx-react";
import * as React from "react";
import { CSSProperties, FunctionComponent, ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";

const INITIAL_ROW_HEIGHT = 16.5;

export interface IProps {
    player: JKFPlayer;
    style?: CSSProperties;
    initialHeight?: number;
    hidden?: boolean;

    // Cannot use position: absolute inside foreignObject in Safari. In that case height should be determined from outside
    // https://stackoverflow.com/questions/51313873/svg-foreignobject-not-working-properly-on-safari
    noPositionAbsoluteForSafariBug: boolean;
}

@observer
export default class KifuList extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public onChange(tesuu: number) {
        this.props.player.goto(tesuu);
    }

    public render() {
        const { player, ...restProps } = this.props;
        const options = player.getReadableKifuState().map((kifu, i) => {
            const node = (
                <>
                    <span style={{ fontFamily: "monospace" }}>{kifu.comments.length > 0 ? "*" : "\xa0"}</span>
                    <span style={{ display: "inline-block", minWidth: "20px", textAlign: "right" }}>
                        {i === 0 || kifu.moveFormat.special ? "" : i.toString()}
                    </span>
                    {" " + kifu.kifu + " " + kifu.forks.join(" ")}
                </>
            );
            return {
                node,
                value: i,
            };
        });
        return <DivList options={options} onChange={this.onChange} tesuu={player.tesuu} {...restProps} />;
    }
}

interface IDivListProps {
    options: Array<{
        node: ReactNode;
        value: number;
    }>;
    onChange: (tesuu: number) => void;
    tesuu: number;
    style?: CSSProperties;
    noPositionAbsoluteForSafariBug: boolean;
    initialHeight?: number;
    hidden?: boolean;
}

const DivList: FunctionComponent<IDivListProps> = ({
    options,
    onChange,
    tesuu,
    style,
    noPositionAbsoluteForSafariBug,
    initialHeight,
    hidden = false,
}) => {
    const [containerHeight, setContainerHeight] = useState<number | null>(null);
    const [rowHeight, setRowHeight] = useState<number | null>(null);
    const [tesuuInitiatedByScroll, setTesuuInitiatedByScroll] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>();
    const ref = useRef<HTMLDivElement>();
    useLayoutEffect(() => {
        if (ref.current && containerRef.current) {
            if (tesuuInitiatedByScroll !== tesuu) {
                scrollToCenter(ref.current, containerRef.current);
            }
            setTesuuInitiatedByScroll(null);
        }
    }, [tesuu, containerHeight]);
    useLayoutEffect(() => {
        if (ref.current && !rowHeight) {
            // Only set at first. More correct if it reads heights of the first and the last rows.
            setRowHeight(getComputedHeight(ref.current));
        }
    }, []);
    useLayoutEffect(() => {
        if (containerRef.current) {
            // TODO: use ResizeObserver. I tried it once but couldn't figure out ResizeObserver loop limit issue.
            const height = getComputedHeight(containerRef.current);
            if (containerHeight !== height) {
                setContainerHeight(height);
            }
        }
    });
    // Initial heights are used for SSR only
    const derivedRowHeight = rowHeight ?? INITIAL_ROW_HEIGHT;
    const derivedContainerHeight = containerHeight ?? initialHeight ?? derivedRowHeight;
    const paddingHeight = `${(derivedContainerHeight - derivedRowHeight) / 2 - 1}px`;
    const onScroll = useCallback(() => {
        if (containerHeight === null) {
            return;
        }
        const scrollTop = containerRef.current.scrollTop + containerHeight / 2;
        if (ref.current.offsetTop > scrollTop) {
            let cursor = ref.current;
            let count = 1;
            while (
                cursor.previousElementSibling &&
                (cursor.previousElementSibling as HTMLDivElement).offsetTop > scrollTop
            ) {
                cursor = cursor.previousElementSibling as HTMLDivElement;
                count++;
            }
            onChange(tesuu - count);
            setTesuuInitiatedByScroll(tesuu - count);
        } else if (
            ref.current.nextElementSibling &&
            (ref.current.nextElementSibling as HTMLDivElement).offsetTop < scrollTop
        ) {
            let cursor = ref.current.nextElementSibling;
            let count = 1;
            while (cursor.nextElementSibling && (cursor.nextElementSibling as HTMLDivElement).offsetTop < scrollTop) {
                cursor = cursor.nextElementSibling;
                count++;
            }
            onChange(tesuu + count);
            setTesuuInitiatedByScroll(tesuu + count);
        }
    }, [tesuu, containerHeight, containerRef.current, ref.current]);
    const onKeyDown = useCallback<(e: React.KeyboardEvent<HTMLDivElement>) => void>(
        (e) => {
            if (e.key === "ArrowDown") {
                onChange(tesuu + 1);
                e.preventDefault();
            } else if (e.key === "ArrowUp") {
                onChange(tesuu - 1);
                e.preventDefault();
            }
        },
        [tesuu],
    );
    return hidden ? (
        <div
            style={{
                flexGrow: 1,
                border: `1px rgb(118, 118, 118, 0.3) solid`,
                borderRadius: "2px",
                fontSize: "x-small",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            （非表示）
        </div>
    ) : (
        <div
            className="kifuforjs-kifulist"
            onScroll={onScroll}
            onKeyDown={onKeyDown}
            ref={containerRef}
            tabIndex={0}
            role="listbox"
            aria-label="手数"
            style={{
                ...(noPositionAbsoluteForSafariBug ? {} : { position: "relative" }),
                flexGrow: 1,
                overflowY: "scroll",
                overflowX: "auto",
                border: "1px rgb(118, 118, 118) solid",
                borderRadius: "2px",
                fontSize: "small",
                cursor: "default",
                ...style,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    width: "100%",
                    ...(noPositionAbsoluteForSafariBug ? {} : { position: "absolute" }),
                    // Safari has a positioning bug within foreignObject
                    // ...(hidden ? { filter: "blur(5px)" } : {}),
                }}
            >
                <div style={{ height: paddingHeight }} />
                {options.map(({ node, value }) => (
                    <div
                        key={value}
                        role="option"
                        style={{
                            padding: "0 2px",
                            // TODO: restore following CSS
                            // .kifuforjs-kifulist:focus-visible [aria-selected="true"] {
                            //   background-color: #99c8ff;
                            // }
                            backgroundColor: value === tesuu ? "rgba(106, 106, 106, 0.35)" : undefined,
                        }}
                        onClick={() => onChange(value)}
                        aria-selected={value === tesuu}
                        ref={value === tesuu ? ref : null}
                    >
                        {node}
                    </div>
                ))}
                <div style={{ height: paddingHeight }} />
            </div>
        </div>
    );
};

function scrollToCenter(element: HTMLElement, container: HTMLElement) {
    // scrollTop is integer, thus it cannot scroll to the center pixel-perfectly. TODO: improve it somehow
    container.scrollTop = element.offsetTop + getComputedHeight(element) / 2 - getComputedHeight(container) / 2;
}

function getComputedHeight(el: HTMLElement) {
    return parseInt(getComputedStyle(el).height.replace("px", ""), 10);
}
