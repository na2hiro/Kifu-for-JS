import { removeIndentation } from "../../utils/util";
import { IOptions } from "./KifuStore";

export function parseOptionsFromAttributes(element: HTMLElement): IOptions {
    const forkPointers = element.dataset.forkpointers ? JSON.parse(element.dataset.forkpointers) : undefined;
    return {
        forkPointers:
            Array.isArray(forkPointers) && forkPointers.every((p) => Array.isArray(p) && p.length === 2)
                ? forkPointers
                : undefined,
        kifu: removeIndentation(element.textContent),
        ply: element.dataset.ply ? parseInt(element.dataset.ply, 10) : undefined,
        src: element.dataset.src,
        reverse: parseReverse(),
        static: parseStatic(),
        tsume: parseTsume(),
    };

    function parseReverse(): IOptions["reverse"] {
        const name = element.dataset.reverseName;
        if (name) {
            return { name };
        }
        if (!("reverse" in element.dataset)) {
            return undefined;
        }
        return {};
    }

    function parseStatic(): IOptions["static"] {
        if (!("static" in element.dataset)) {
            return undefined;
        }
        const last = element.dataset.staticLast;
        if (last === "hidden") {
            return { last: "hidden" as const };
        }
        const parsed = last ? JSON.parse(last) : undefined;
        if (Array.isArray(parsed) && parsed.length === 2 && parsed.every((n) => typeof n === "number")) {
            return { last: parsed as [number, number] };
        }
        return {};
    }

    function parseTsume(): IOptions["tsume"] {
        if (!("tsume" in element.dataset)) {
            return undefined;
        }
        if (element.dataset.tsume === "false") return false;

        return {
            kingsHand: ["", "true"].indexOf(element.dataset.tsumeKingshand) >= 0 ? true : undefined,
            citation: ["", "true"].indexOf(element.dataset.tsumeCitation) >= 0 ? true : undefined,
            hideAnswer: ["", "true"].indexOf(element.dataset.tsumeHideanswer) >= 0 ? true : undefined,
        };
    }
}
