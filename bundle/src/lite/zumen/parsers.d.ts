export declare const ZenSuuji = "\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19";
export declare const KanSuuji = "\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D";
export declare const KomaStr = "\u7389\u98DB\u89D2\u91D1\u9280\u6842\u9999\u6B69\u7389\u9F8D\u99AC\u91D1\u5168\u572D\u674F\u3068";
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
export declare const readzumen: (text: string) => false | any[];
