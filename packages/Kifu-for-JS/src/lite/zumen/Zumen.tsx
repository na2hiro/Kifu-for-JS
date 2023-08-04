/*
 shogizumen.js ver.20170713
 (c) maasa. | http://www.geocities.jp/ookami_maasa/shogizumen/
*/

import React, { PropsWithChildren, ReactNode /*, SVGTextElementAttributes*/ } from "react";
import { IMoveMoveFormat, IStateFormat } from "json-kifu-format/src/Formats";
import { cellEqual } from "./zumenCompat";
import { Color, kindToString } from "shogi.js";
import { KanSuuji, scolor, ZenSuuji } from "./lib";
import { Mochigoma } from "./Mochigoma";

/**
 * TODO: Customize mochigoma display for tsume shogi
 */
type Props = {
    width?: number;
    height?: number;
    state?: IStateFormat;
    latestMove?: IMoveMoveFormat;
    players?: [string | undefined, string | undefined];
};
export const Zumen: React.FC<PropsWithChildren<Props>> = ({ width, height, state, latestMove, children, players }) => {
    if (!state) return null;

    let kx = 25;

    const dx = Math.floor(kx * 1.25);
    const dy = Math.floor(kx * 0.75);

    let dp = 1 / 2;

    const lines: ReactNode[] = [];
    Array.from({ length: 9 }, (v, i) => i).forEach((i) => {
        if (i) {
            lines.push(
                <line
                    key={i + "h"}
                    x1={i * kx + dx + dp / 2}
                    x2={i * kx + dx + dp / 2}
                    y1={dy + dp / 2}
                    y2={dy + kx * 9 + dp / 2}
                    strokeWidth={dp}
                    stroke={scolor}
                />,
            );
            lines.push(
                <line
                    key={i + "v"}
                    y1={i * kx + dy + dp / 2}
                    y2={i * kx + dy + dp / 2}
                    x1={dx + dp / 2}
                    x2={dx + kx * 9 + dp / 2}
                    strokeWidth={dp}
                    stroke={scolor}
                />,
            );
        }
        lines.push(
            <text
                key={i + "h-num"}
                x={i * kx + dx + kx / 2}
                y={dy - kx / 6}
                fontSize={kx * 0.4}
                fill={scolor}
                textAnchor="middle"
            >
                {ZenSuuji.charAt(8 - i)}
            </text>,
        );
        lines.push(
            <text
                key={i + "v-num"}
                x={dx + kx * 9 + kx * 0.35}
                y={i * kx + dy + kx * 0.6}
                fontSize={kx * 0.4}
                fill={scolor}
                textAnchor="middle"
            >
                {KanSuuji.charAt(i)}
            </text>,
        );
    });
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
                fontFamily: "serif",
                // TODO: allow selection in text children
                userSelect: "none",
            }}
            viewBox={"0 0 " + width + " " + height}
        >
            <g>
                <rect
                    x={dx}
                    y={dy}
                    width={kx * 9 + 1}
                    height={kx * 9 + 1}
                    fill="none"
                    stroke={scolor}
                    strokeWidth={2}
                />
                {lines}
            </g>
            <g>
                {Array.from({ length: 81 }, (v, i) => i).map((i) => {
                    const tgChildren: ReactNode[] = [];
                    let tgTransform: string;
                    const piece = state.board[8 - (i % 9)][Math.floor(i / 9)];
                    if (!("kind" in piece && "color" in piece)) {
                        return null;
                    }
                    const x = (i % 9) * kx + dx + kx / 2 + dp / 2;
                    const y = Math.floor(i / 9) * kx + dy + kx / 2 + dp / 2;

                    let t = kindToString(piece.kind);
                    const textAttributes: /*SVGTextElementAttributes<any>*/ any = {};
                    if (t.length === 2) {
                        // 成X
                        t = t[1];
                        tgChildren.push(
                            <text
                                fill={scolor}
                                fontSize={kx * 0.82}
                                textAnchor="middle"
                                dy={-kx * 0.09}
                                {...(cellEqual(i, latestMove?.to)
                                    ? { fontFamily: "sans-serif", fontWeight: "bold" }
                                    : {})}
                            >
                                成
                            </text>,
                        );

                        textAttributes.dy = kx * (0.32 + 0.41);
                        tgTransform = `translate(${x},${y}) scale(${
                            piece.color === Color.White ? "-1,-0.5" : "1,0.5"
                        })`;
                    } else {
                        textAttributes.dy = kx * 0.32;
                        tgTransform = `translate(${x},${y})${piece.color === Color.White ? " scale(-1,-1)" : ""}`;
                    }
                    textAttributes.fontSize = kx * 0.82;
                    if (cellEqual(i, latestMove?.to)) {
                        textAttributes.style = { fontWeight: "bold" };
                        textAttributes.fontFamily = "sans-serif";
                    }
                    textAttributes.textAnchor = "middle";

                    tgChildren.push(<text {...textAttributes}>{t}</text>);

                    return (
                        <g key={i} transform={tgTransform}>
                            {tgChildren}
                        </g>
                    );
                })}
            </g>
            <Mochigoma v={0} kx={kx} hand={state.hands[0]} name={players?.[0]} />
            <Mochigoma v={1} kx={kx} hand={state.hands[1]} name={players?.[1]} />
            {children}
        </svg>
    );
};
