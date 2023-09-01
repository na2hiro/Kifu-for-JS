import * as React from "react";
import { Color, Kind } from "shogi.js";
import KifuStore from "../common/stores/KifuStore";
export interface IProps {
    data: {
        color?: Color;
        kind?: Kind;
    };
    lastMove: any;
    x: number;
    y: number;
    kifuStore: KifuStore;
    connectDropTarget?: (obj: any) => Element;
    connectDragSource?: (obj: any) => Element;
    isDragging?: boolean;
}
export default class Piece extends React.Component<IProps, any> {
    render(): React.ReactNode;
}
