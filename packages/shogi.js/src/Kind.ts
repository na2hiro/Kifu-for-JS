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
