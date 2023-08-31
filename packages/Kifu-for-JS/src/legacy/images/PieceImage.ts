/* disable:ordered-imports object-literal-sort-keys */
import FU0 from "./0FU.png";
import KY0 from "./0KY.png";
import KE0 from "./0KE.png";
import GI0 from "./0GI.png";
import KI0 from "./0KI.png";
import KA0 from "./0KA.png";
import HI0 from "./0HI.png";
import OU0 from "./0OU.png";
import TO0 from "./0TO.png";
import NY0 from "./0NY.png";
import NK0 from "./0NK.png";
import NG0 from "./0NG.png";
import UM0 from "./0UM.png";
import RY0 from "./0RY.png";
import FU1 from "./1FU.png";
import KY1 from "./1KY.png";
import KE1 from "./1KE.png";
import GI1 from "./1GI.png";
import KI1 from "./1KI.png";
import KA1 from "./1KA.png";
import HI1 from "./1HI.png";
import OU1 from "./1OU.png";
import TO1 from "./1TO.png";
import NY1 from "./1NY.png";
import NG1 from "./1NG.png";
import NK1 from "./1NK.png";
import UM1 from "./1UM.png";
import RY1 from "./1RY.png";
import blank from "./blank.png";

const MAP = {
    FU: [FU0, FU1],
    KY: [KY0, KY1],
    KE: [KE0, KE1],
    GI: [GI0, GI1],
    KI: [KI0, KI1],
    KA: [KA0, KA1],
    HI: [HI0, HI1],
    OU: [OU0, OU1],
    TO: [TO0, TO1],
    NY: [NY0, NY1],
    NK: [NK0, NK1],
    NG: [NG0, NG1],
    UM: [UM0, UM1],
    RY: [RY0, RY1],
};

export function getUrlWithReverse(piece: { kind: string; color: number }, reversed: boolean) {
    if (piece && piece.kind) {
        return getUrl(piece.kind, reversed ? 1 - piece.color : piece.color);
    } else {
        return blank;
    }
}

export function getUrl(kind: string, color: number) {
    const arr = MAP[kind];
    return arr ? arr[color] : blank;
}
