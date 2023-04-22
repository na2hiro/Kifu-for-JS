import { JKFPlayer } from "json-kifu-format";
import { observer } from "mobx-react";
import * as React from "react";
import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { pad } from "./utils/util";

export interface IProps {
    player: JKFPlayer;
    isPortrait: boolean;
}

@observer
export default class KifuList extends React.Component<IProps, any> {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public onChange(tesuu: number) {
        this.props.player.goto(tesuu);
    }

    public render() {
        const { player } = this.props;
        const options = player.getReadableKifuState().map((kifu, i) => {
            const text =
                (kifu.comments.length > 0 ? "*" : "\xa0") +
                pad(i.toString(), "\xa0", 3) +
                " " +
                kifu.kifu +
                " " +
                kifu.forks.join(" ");
            return {
                text,
                value: i,
            };
        });
        return <DivList options={options} onChange={this.onChange} tesuu={player.tesuu} />;
    }
}

const DivList: FunctionComponent<IKifuProps> = ({ options, onChange, tesuu }) => {
    const [containerHeight, setContainerHeight] = useState<number | null>(null);
    const [paddingHeight, setPaddingHeight] = useState<string>("");
    const [rowHeight, setRowHeight] = useState<number | null>(null);
    const [tesuuInitiatedByScroll, setTesuuInitiatedByScroll] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>();
    const ref = useRef<HTMLDivElement>();
    useEffect(() => {
        if (ref.current && containerRef.current) {
            if (tesuuInitiatedByScroll !== tesuu) {
                scrollToCenter(ref.current, containerRef.current);
            }
            setTesuuInitiatedByScroll(null);
        }
    }, [tesuu, containerHeight]);
    useEffect(() => {
        if (containerRef.current && ref.current) {
            let newRowHeight = rowHeight;
            if (rowHeight === null) {
                newRowHeight = ref.current.getBoundingClientRect().height;
                // Only set at first
                setRowHeight(newRowHeight);
            }

            const { height } = containerRef.current.getBoundingClientRect();
            if (containerHeight !== height) {
                setContainerHeight(height);
            }
            const newPaddingHeight = `${(height - newRowHeight) / 2 - 1}px`;
            if (newPaddingHeight !== paddingHeight) {
                setPaddingHeight(newPaddingHeight);
            }
        }
    });
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
    return (
        <div className="kifuforjs-kifulist" onScroll={onScroll} onKeyDown={onKeyDown} ref={containerRef} tabIndex={0}>
            <div className="kifuforjs-kifulist-inner" role="listbox" aria-label="手数">
                <div style={{ height: paddingHeight }} />
                {options.map(({ text, value }) => (
                    <div
                        key={value}
                        role="option"
                        // tslint:disable-next-line jsx-no-lambda
                        onClick={() => onChange(value)}
                        aria-selected={value === tesuu}
                        ref={value === tesuu ? ref : null}
                    >
                        {text}
                    </div>
                ))}
                <div style={{ height: paddingHeight }} />
            </div>
        </div>
    );
};

function scrollToCenter(element, container) {
    container.scrollTop =
        element.offsetTop + element.getBoundingClientRect().height / 2 - container.getBoundingClientRect().height / 2;
}

interface IKifuProps {
    options: Array<{
        text: string;
        value: number;
    }>;
    onChange: (tesuu: number) => void;
    tesuu: number;
}
