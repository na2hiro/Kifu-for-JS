import { IPlaceFormat, IStateFormat } from "json-kifu-format/src/Formats";
import React, { CSSProperties } from "react";
/**
 * TODO: Customize mochigoma display for tsume shogi
 */
interface IProps {
    width?: number;
    height?: number;
    state?: IStateFormat;
    hideKingsHand?: boolean;
    citation?: string;
    latestMoveTo?: IPlaceFormat;
    players?: [string | undefined, string | undefined];
    style?: CSSProperties;
    ref?: React.Ref<SVGSVGElement>;
    reverse?: boolean;
}
declare const Zumen: React.ForwardRefExoticComponent<Pick<React.PropsWithChildren<IProps>, "reverse" | "style" | "hideKingsHand" | "citation" | "children" | "width" | "height" | "state" | "latestMoveTo" | "players"> & React.RefAttributes<SVGSVGElement>>;
export default Zumen;
