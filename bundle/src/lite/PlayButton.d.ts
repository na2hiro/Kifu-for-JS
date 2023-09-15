import * as React from "react";
import { Kickout } from "./useInterval";
import { MutableRefObject } from "react";
type Props = {
    step: () => void;
    shouldStop: () => boolean;
    style?: React.CSSProperties;
    kickout?: MutableRefObject<Kickout>;
};
declare const _default: React.FC<React.PropsWithChildren<Props>>;
export default _default;
