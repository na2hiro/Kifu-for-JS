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
        static: parseStatic(),
    };

    function parseStatic() {
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
}
