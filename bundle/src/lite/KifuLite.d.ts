import * as React from "react";
import { CSSProperties } from "react";
import KifuStore, { IOptions } from "../common/stores/KifuStore";
import "../../css/kifuforjs.scss";
export type IProps = {
    /**
     * A controller object for the kifu.
     */
    kifuStore?: KifuStore;
    /**
     * CSS to be applied to the svg element
     */
    style?: CSSProperties;
} & IOptions;
declare const _default: React.FC<React.PropsWithChildren<IProps>>;
export default _default;
