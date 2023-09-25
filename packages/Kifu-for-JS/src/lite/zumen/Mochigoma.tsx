import { IHandFormat } from "json-kifu-format/src/Formats";
import React, { FC } from "react";
import { isRawKind, kindToString, values as kindValues } from "shogi.js/cjs/Kind";
import { KanSuuji, scolor } from "./lib";

function amountToString(amount: number) {
    if (amount <= 1) {
        return "";
    }
    let r = "";
    if (amount > 10) {
        r += "十";
        amount -= 10;
    }
    return r + KanSuuji.charAt(amount - 1);
}

const handToString = function (hand: IHandFormat) {
    return (
        kindValues
            .map((kind) => ({ kind, amount: hand[kind] }))
            .filter(({ kind, amount }) => isRawKind(kind) && amount > 0)
            .reverse()
            .map(({ kind, amount }) => kindToString(kind, true) + amountToString(amount))
            .join("") || "なし"
    );
};
interface IProps {
    v: number;
    kx: number;
    name?: string;
    hand: IHandFormat;
    leftCrowded?: boolean;
    reverse: boolean;
}
const turns = ["先手", "後手"];
export const Mochigoma: FC<IProps> = ({ v, kx, hand, name = turns[v], leftCrowded, reverse }) => {
    const textCount = 14;
    const t = name + "　" + handToString(hand);
    const py = (-t.length * kx * 9) / textCount;
    const vPos = reverse ? 1 - v : v;

    // Originally 14, but made 13 in order to make a space for the config icon
    const textAreaCount = vPos == 0 ? 14 : 13;
    const r = t.length > textAreaCount ? textAreaCount / t.length : 1;
    const sgm = name[0] === "☗" || name[0] === "☖" ? 1 : 0;
    return (
        <g
            transform={
                vPos == 0
                    ? "translate(" + kx * 11.35 + "," + kx * 9.7 + ") scale(1," + r + ")"
                    : "translate(" + kx * 0.65 * (leftCrowded ? 1.25 : 1) + "," + kx * 0.8 + ") scale(-1," + -r + ")"
            }
        >
            {Array.from({ length: t.length - sgm }, (_v, i) => i).map((i) => (
                <text
                    key={i}
                    fontSize={(kx * 9) / textCount}
                    fill={scolor}
                    textAnchor="middle"
                    x={0}
                    y={(-i * kx * 9) / textCount}
                >
                    {t.charAt(t.length - i - 1)}
                </text>
            ))}
            {sgm && (
                <polygon
                    points={`0,${py} ${kx * 0.23},${py + kx * 0.1} ${kx * 0.3},${py + kx * 0.6} ${kx * -0.3},${
                        py + kx * 0.6
                    } ${kx * -0.23},${py + kx * 0.1}`}
                    fill={v != 0 ? "none" : scolor}
                    stroke={scolor}
                    strokeWidth={kx / 25}
                />
            )}
        </g>
    );
};
