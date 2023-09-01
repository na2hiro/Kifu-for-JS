enum KindEnum {
    FU,
    KY,
    KE,
    GI,
    KI,
    KA,
    HI,
    OU,
    TO,
    NY,
    NK,
    NG,
    UM,
    RY,
}

const rawKinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI"] as const;

export type Kind = keyof typeof KindEnum;
export type RawKind = Extract<Kind, "FU" | "KY" | "KE" | "GI" | "KI" | "KA" | "HI">;

// TODO: this needs type annotations
export const values: Kind[] = Object.keys(KindEnum).filter((k) =>
    Number.isNaN(parseInt(k))
) as Kind[];

export function kindToString(kind: Kind, short = false): string {
    return {
        FU: "歩",
        KY: "香",
        KE: "桂",
        GI: "銀",
        KI: "金",
        KA: "角",
        HI: "飛",
        OU: "玉",
        TO: "と",
        NY: short ? "杏" : "成香",
        NK: short ? "圭" : "成桂",
        NG: short ? "全" : "成銀",
        UM: "馬",
        RY: "龍",
    }[kind];
}

export function isRawKind(kind: Kind): kind is RawKind {
    return rawKinds.indexOf(kind as RawKind) >= 0;
}
