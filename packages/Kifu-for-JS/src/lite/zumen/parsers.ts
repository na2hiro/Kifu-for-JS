/**
 * This parser is deprecated and kept for documentation purposes.
 * TODO: rewrite so it will generate object which Zumen component accepts.
 */
const HanSuuji = "123456789";
export const ZenSuuji = "１２３４５６７８９";
export const KanSuuji = "一二三四五六七八九";
export const KomaStr = "玉飛角金銀桂香歩玉龍馬金全圭杏と";
const convMgRepeat = function (str) {
    let re = new RegExp("[" + ZenSuuji + KanSuuji + "]", "g");
    str = str.replace(re, function (a) {
        return HanSuuji.charAt((ZenSuuji + KanSuuji).indexOf(a) % 9);
    });
    str = str.replace("０", "0");
    str = str.replace(/十([1-9])/, "1$1");
    str = str.replace("十", "10");
    str = str.replace(/(.)(1?[0-9])/g, function (a, b, c) {
        for (let i = 0, s = ""; i < c; i++) {
            s += b;
        }
        return s;
    });
    return str;
};
const convKomaStr = function (str) {
    str = str.replace("王", "玉");
    str = str.replace("竜", "龍");
    str = str.replace("仝", "杏");
    str = str.replace("个", "と");
    return str;
};
/**
 * Converts the given text to a shogi board representation.
 *
 * Ban is an array of 98 elements.
 * <ul>
 * <li>The first 81 elements (indexed from 0 to 80) are the board squares, starting from the top left.<ul>
 *   <li>5th position: turn</li>
 *   <li>4th position: promoted or not</li>
 * </ul>3rd to 1st: kind</li>
 * <li>The next 7 elements (indexed from 81 to 87) are the amount of captured pieces for the first player.</li>
 * <li>The next 7 elements (indexed from 88 to 93) are the amount of captured pieces for the second player.</li>
 * <li>94 ?</li>
 * <li>The next 2 elements (indexed from 95 to 96) are name of the players.</li>
 * <li>The last element (indexed 97) is the position of the latest move. negative if not available.</li>
 * </ul>
 *
 * @param {string} text - The text to parse.
 * @returns {number[]} - The shogi board representation.
 */
export const readzumen = function (text: string) {
    let mr, mk, x, y, s, c, i, re2;
    const ban = new Array(98);
    for (let i = 0; i < 95; i++) {
        ban[i] = 0;
    }
    ban[95] = "先手";
    ban[96] = "後手";
    ban[97] = -1;
    let mgStrSente = "";
    let mgStrGote = "";
    let re = /^([先下後上]手の)?持駒：([^\n]*)/gm;
    while ((mr = re.exec(text)) != null) {
        if (/[後上]/.test(mr[1])) {
            mgStrGote = mr[2];
        } else {
            mgStrSente = mr[2];
        }
    }
    re = /^([先下後上]手)：(.*)\n/gm;
    while ((mr = re.exec(text)) != null) {
        mr[2].replace(/^\s+/, "");
        mr[2].replace(/(\s|　).*$/, "");
        if (/[後上]/.test(mr[1])) {
            ban[96] = mr[2];
        } else {
            ban[95] = mr[2];
        }
    }
    y = 1;
    re = /^\|([^\n]*)/gm;
    while ((mr = re.exec(text)) != null) {
        mr[1] = convKomaStr(mr[1]);
        x = 9;
        re2 = new RegExp("([\\+\\-vV\\^\\s])(.)", "g");
        while ((mk = re2.exec(mr[1])) != null) {
            s = "vV-".indexOf(mk[1]) > -1 ? 2 : 0; // 5th: turn
            if ((c = KomaStr.indexOf(mk[2])) > -1) {
                if (c > 7) {
                    c -= 8;
                    s = s | 1; // 4th: promoted
                }
                // xysAry[c]+=""+x+y+s;
                ban[y * 9 - x] = s * 8 + c + 1; // 1st-3rd: kind
            }
            if (--x < 1) {
                break;
            }
        }
        if (++y > 9) {
            break;
        }
    }
    if (y == 1) {
        return false;
    }
    mgStrSente = convMgRepeat(mgStrSente);
    for (i = 0; i < mgStrSente.length; i++) {
        if ((c = KomaStr.indexOf(mgStrSente.charAt(i))) > 0) {
            ban[81 + c - 1] += 1;
        }
    }
    mgStrGote = convMgRepeat(mgStrGote);
    for (i = 0; i < mgStrGote.length; i++) {
        if ((c = KomaStr.indexOf(mgStrGote.charAt(i))) > 0) {
            ban[88 + c - 1] += 1;
        }
    }
    re = /^手数＝\d+\s+[▲△▽]?(.)(.)(.*)まで/gm;
    if ((mr = re.exec(text)) != null) {
        let mx = -100;
        if ((c = 0 + mr[1]) > 0) {
            mx = 8 - c;
        } else if ((c = ZenSuuji.indexOf(mr[1])) > 0) {
            mx = 8 - c;
        }
        if ((c = 0 + mr[2]) > 0) {
            mx += c * 9;
        } else if ((c = ZenSuuji.indexOf(mr[2])) > 0) {
            mx += c * 9;
        } else if ((c = KanSuuji.indexOf(mr[2])) > 0) {
            mx += c * 9;
        }
        ban[97] = mx;
    }
    return ban;
};
