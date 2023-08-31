import { IHandFormat } from "json-kifu-format/src/Formats";
import React, { FC } from "react";
import { isRawKind, kindToString, values as kindValues } from "shogi.js/cjs/Kind";
import { KanSuuji, scolor } from "./lib";

const sgm = 1;

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
}
const turns = ["先手", "後手"];
const marks = "☗☖";
export const Mochigoma: FC<IProps> = ({ v, kx, hand, name = turns[v] }) => {
    const t = marks[v] + name + "　" + handToString(hand);
    const py = (-t.length * kx * 9) / 14;

    // Originally 14, but made 13 in order to make a space for the config icon
    const r = t.length > 13 ? 13 / t.length : 1;
    return (
        <g
            transform={
                v == 0
                    ? "translate(" + kx * 11.35 + "," + kx * 9.7 + ") scale(1," + r + ")"
                    : "translate(" + kx * 0.65 + "," + kx * 0.8 + ") scale(-1," + -r + ")"
            }
        >
            {Array.from({ length: t.length - sgm }, (_v, i) => i).map((i) => (
                <text key={i} fontSize={(kx * 9) / 14} fill={scolor} textAnchor="middle" x={0} y={(-i * kx * 9) / 14}>
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
