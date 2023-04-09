/* tslint:disable:ordered-imports object-literal-sort-keys */
import FU0 from "../images/0FU.png";
import KY0 from "../images/0KY.png";
import KE0 from "../images/0KE.png";
import GI0 from "../images/0GI.png";
import KI0 from "../images/0KI.png";
import KA0 from "../images/0KA.png";
import HI0 from "../images/0HI.png";
import OU0 from "../images/0OU.png";
import TO0 from "../images/0TO.png";
import NY0 from "../images/0NY.png";
import NK0 from "../images/0NK.png";
import NG0 from "../images/0NG.png";
import UM0 from "../images/0UM.png";
import RY0 from "../images/0RY.png";
import FU1 from "../images/1FU.png";
import KY1 from "../images/1KY.png";
import KE1 from "../images/1KE.png";
import GI1 from "../images/1GI.png";
import KI1 from "../images/1KI.png";
import KA1 from "../images/1KA.png";
import HI1 from "../images/1HI.png";
import OU1 from "../images/1OU.png";
import TO1 from "../images/1TO.png";
import NY1 from "../images/1NY.png";
import NG1 from "../images/1NG.png";
import NK1 from "../images/1NK.png";
import UM1 from "../images/1UM.png";
import RY1 from "../images/1RY.png";
import blank from "../images/blank.png";

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

export function getUrlWithReverse(piece: {kind: string, color: number}, reversed: boolean) {
    if(piece && piece.kind) {
        return getUrl(piece.kind, reversed ? 1 - piece.color : piece.color);
    } else {
        return blank;
    }
}

export function getUrl(kind: string, color: number) {
    const arr = MAP[kind];
    return arr ? arr[color] : blank;
}
