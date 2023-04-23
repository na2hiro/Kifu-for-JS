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

export type Kind = keyof typeof KindEnum;

// TODO: this needs type annotations
export const values: Kind[] = Object.keys(KindEnum).filter((k) =>
    Number.isNaN(parseInt(k))
) as Kind[];

export function kindToString(kind: Kind): string {
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
        NY: "成香",
        NK: "成桂",
        NG: "成銀",
        UM: "馬",
        RY: "龍",
    }[kind];
}
