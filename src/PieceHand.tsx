import * as React from "react";
import { CSSProperties } from "react";
import { DragSource, DropTarget } from "react-dnd";
import { Color } from "shogi.js";
import { getUrlWithReverse } from "./images/PieceImage";

export interface IProps {
    data: any;
    index: number;
    onInputMove: (input: any) => void;
    position: number;
    reversed: boolean;
    signature: number;
    connectDragSource?: (element: any) => any;
    isDragging?: boolean;
}

@DragSource<IProps>(
    "piecehand",
    {
        beginDrag(props, monitor, component) {
            return {
                color: props.data.color,
                imgSrc: getPieceImage(props),
                piece: props.data.kind,
                signature: props.signature,
            };
        },
        endDrag(props, monitor, component) {
            const item = monitor.getItem() as { color: Color; piece: string };
            props.onInputMove({
                color: item.color,
                piece: item.piece,
                to: monitor.getDropResult(),
            });
        },
    },
    function collect(connect, monitor) {
        return {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging(),
        };
    },
)
export default class PieceHand extends React.Component<IProps, any> {
    public render() {
        const style: CSSProperties =
            this.props.position == null
                ? {}
                : { top: 0, left: this.props.position, position: "absolute", zIndex: 100 - this.props.index };
        style.opacity = this.props.isDragging ? 0.4 : 1;
        return this.props.connectDragSource(
            <div>
                <img src={getPieceImage(this.props)} style={style} />
            </div>,
        );
    }
}

function getPieceImage(props) {
    return getUrlWithReverse(props.data.kind, props.data.color, props.reversed);
}
