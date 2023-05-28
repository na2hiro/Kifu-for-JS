import {IJSONKifuFormat} from "../Formats";
import * as CSAParser from "./csa-parser.pegjs";
import * as KI2Parser from "./ki2-parser.pegjs";
import * as KIFParser from "./kif-parser.pegjs";
import {normalizeCSA, normalizeKI2, normalizeKIF} from "../normalizer";

/**
 * Parse CSA string to JSON Kifu Format
 * @param csaString
 */
export function parseCSA(csaString: string): IJSONKifuFormat {
    csaString = normalizeNewLines(csaString);
    const rawJKF = CSAParser.parse(csaString);
    return normalizeCSA(rawJKF);
}

/**
 * Parse KIF string to JSON Kifu Format
 * @param kifString
 */
export function parseKIF(kifString: string): IJSONKifuFormat {
    kifString = normalizeNewLines(kifString);
    const rawJKF = KIFParser.parse(kifString);
    return normalizeKIF(rawJKF);
}

/**
 * Parse KI2 string to JSON Kifu Format
 * @param ki2String
 */
export function parseKI2(ki2String: string): IJSONKifuFormat {
    ki2String = normalizeNewLines(ki2String);
    const rawJKF = KI2Parser.parse(ki2String);
    return normalizeKI2(rawJKF);
}

function normalizeNewLines(kifu: string) {
    if (kifu.slice(-1) === "\n") {
        return kifu;
    }
    return kifu + "\n";
}
