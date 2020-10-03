import * as React from "react";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
    data: any;
    index: number;
    position: number;
    connectDragSource?: (element: any) => any;
    isDragging?: boolean;
}
export default class PieceHand extends React.Component<IProps, any> {
    render(): any;
}
