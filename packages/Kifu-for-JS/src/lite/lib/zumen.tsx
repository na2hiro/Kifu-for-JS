/*
 shogizumen.js ver.20170713
 (c) maasa. | http://www.geocities.jp/ookami_maasa/shogizumen/
*/

import { KanSuuji, ZenSuuji } from "./zumenLib";
import React, { FC, PropsWithChildren, ReactNode /*, SVGTextElementAttributes*/ } from "react";
import { IHandFormat, IMoveMoveFormat, IStateFormat } from "json-kifu-format/src/Formats";
import { cellEqual } from "./zumenCompat";
import { isRawKind, kindToString, values as kindValues } from "shogi.js/src/Kind";
import { Color } from "shogi.js";

/*
var drawall = function () {
  var a = document.querySelectorAll(selector);
  for (var i = 0; i < a.length; i++) {
    var b = a[i];
    var c;
    if (b.tagName.toLowerCase() != selectorTag) {
      c = b.querySelector(selectorTag);
    } else {
      //console.log("pre");
      c = b;
      b = b.parentNode;
    }
    var ban = readzumen(c.innerHTML);
    if (ban != false) {
      var pw = c.offsetWidth;
      var ph = c.offsetHeight;
      c.style.display = "none";
      var e = b.insertBefore(svgdraw(pw, ph, ban), c);
      e.appendChild(c);
    }
  }
};
 */
var svgNS = "http://www.w3.org/2000/svg";
var sgm = 1;
var scolor = "currentColor";

function amountToString(amount: number) {
    if (amount <= 1) return "";
    let r = "";
    if (amount > 10) {
        r += "十";
        amount -= 10;
    }
    return r + KanSuuji.charAt(amount - 1);
}

var mgpack = function (hand: IHandFormat) {
    return (
        kindValues
            .map((kind) => ({ kind, amount: hand[kind] }))
            .filter(({ kind, amount }) => isRawKind(kind) && amount > 0)
            .reverse()
            .map(({ kind, amount }) => kindToString(kind, true) + amountToString(amount))
            .join("") || "なし"
    );
};
type MochigomaProps = {
    v: number;
    kx: number;
    name?: string;
    hand: IHandFormat;
};
const turns = ["先手", "後手"];
const marks = "☗☖";
const Mochigoma: FC<MochigomaProps> = ({ v, kx, hand, name = turns[v] }) => {
    const t = marks[v] + name + "　" + mgpack(hand);
    const py = (-t.length * kx * 9) / 14;

    const r = t.length > 14 ? 14 / t.length : 1;
    return (
        <g
            transform={
                v == 0
                    ? "translate(" + kx * 11.35 + "," + kx * 9.7 + ") scale(1," + r + ")"
                    : "translate(" + kx * 0.65 + "," + kx * 0.8 + ") scale(-1," + -r + ")"
            }
        >
            {Array.from({ length: t.length - sgm }, (v, i) => i).map((i) => (
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

/**
 * TODO: Customize mochigoma display for tsume shogi
 */
type Props = {
    width?: number;
    height?: number;
    state?: IStateFormat;
    latestMove?: IMoveMoveFormat;
};
export const Zumen: React.FC<PropsWithChildren<Props>> = ({ width, height, state, latestMove, children }) => {
    if (!state) return null;

    console.log({ state });

    let kx = 25;

    const dx = Math.floor(kx * 1.25);
    const dy = Math.floor(kx * 0.75);

    let dp: number;
    // This doesn't exist on server side
    //if (window.devicePixelRatio && window.devicePixelRatio >= 2) {
    dp = 1 / 2;
    /*} else {
    dp = 1;
  }*/

    // Display raw text feature
    /*
  (function (u) {
    u.onmouseover = function (e) {
      this.childNodes[1].style.display = "block";
    };
    u.onmouseout = function (e) {
      this.childNodes[1].style.display = "none";
    };
  })(wrap);
  const btn = document.createElement("div");
  btn.style.position = "absolute";
  btn.style.right = 0 + "px";
  btn.style.top = 0 + "px";
  btn.style.zIndex = "9999";
  btn.style.width = "30px";
  btn.style.height = "16px";
  btn.style.borderRadius = "4px";
  btn.style.backgroundColor = "#CCC";
  btn.style.display = "none";
  btn.style.fontSize = "14px";
  btn.style.lineHeight = "1";
  btn.style.color = "black";
  btn.style.cursor = "pointer";
  btn.style.baseline = "middle";
  btn.title = "表示切替（局面図⇔kif形式）";
  btn.style.textAlign = "center";

  btn.innerHTML = "⇔";
  btn.onclick = function () {
    const d = this.parentNode;
    if (this.previousSibling.style.display == "none") {
      this.previousSibling.style.display = "";
      this.nextSibling.style.display = "none";
    } else {
      this.previousSibling.style.display = "none";
      this.nextSibling.style.display = "";
    }
  };
   */
    // wrap.appendChild(btn);
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
        <svg xmlns={svgNS} style={{ fontFamily: "serif", width, height }} viewBox={"0 0 " + kx * 12 + " " + kx * 10}>
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
                    const banElement = state.board[8 - (i % 9)][Math.floor(i / 9)];
                    if (!("kind" in banElement && "color" in banElement)) {
                        return null;
                    }
                    const x = (i % 9) * kx + dx + kx / 2 + dp / 2;
                    const y = Math.floor(i / 9) * kx + dy + kx / 2 + dp / 2;

                    let t = kindToString(banElement.kind);
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
                        if (banElement.color === Color.White) {
                            tgTransform = "translate(" + x + "," + y + ") scale(-1,-0.5)";
                        } else {
                            tgTransform = "translate(" + x + "," + y + ") scale(1,0.5)";
                        }
                    } else {
                        textAttributes.dy = kx * 0.32;
                        if (banElement.color === Color.White) {
                            tgTransform = "translate(" + x + "," + y + ") scale(-1,-1)";
                        } else {
                            tgTransform = "translate(" + x + "," + y + ")";
                        }
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
            <Mochigoma v={0} kx={kx} hand={state.hands[0]} />;
            <Mochigoma v={1} kx={kx} hand={state.hands[1]} />;{children}
        </svg>
    );
};
