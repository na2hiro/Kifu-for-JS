import {IJSONKifuFormat} from "../Formats";
import "./ambient";
import * as CSAParser from "./csa-parser.pegjs";
import * as KI2Parser from "./ki2-parser.pegjs";
import * as KIFParser from "./kif-parser.pegjs";

export function parseCSA(csaString: string): IJSONKifuFormat {
    return CSAParser.parse(csaString);
}

export function parseKIF(kifString: string): IJSONKifuFormat {
    return KIFParser.parse(kifString);
}

export function parseKI2(ki2String: string): IJSONKifuFormat {
    return KI2Parser.parse(ki2String);
}
