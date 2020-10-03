import * as React from "react";
import { Color } from "shogi.js";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    data: {
        color?: Color;
        kind?: string;
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
