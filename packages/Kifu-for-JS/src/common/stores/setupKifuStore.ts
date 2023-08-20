import { IOptions } from "./KifuStore";

export function parseOptionsFromAttributes(element: HTMLElement): IOptions {
    const forkpointers = element.dataset.forkpointers ? JSON.parse(element.dataset.forkpointers) : undefined;
    return {
        kifu: element.textContent,
        src: element.dataset.src,
        ply: element.dataset.ply ? parseInt(element.dataset.ply) : undefined,
        forkpointers:
            Array.isArray(forkpointers) && forkpointers.every((p) => Array.isArray(p) && p.length === 2)
                ? forkpointers
                : undefined,
        static: parseStatic(),
    };

    function parseStatic() {
        if (!("static" in element.dataset)) {
            return undefined;
        }
        const last = element.dataset["staticLast"];
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
