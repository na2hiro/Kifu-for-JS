import { observer } from "mobx-react";
import * as React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { Color, colorToString, kindToString } from "shogi.js";
import { getUrlWithReverse } from "./images/PieceImage";
import KifuStore from "../common/stores/KifuStore";

export interface IProps {
    data: { color?: Color; kind?: string }; // TODO
    lastMove: any; // TODO
    x: number;
    y: number;
    kifuStore: KifuStore;

    connectDropTarget?: (obj: any) => Element;
    connectDragSource?: (obj: any) => Element;
    isDragging?: boolean;
}

function getLabel({ color, kind }: { color?: Color; kind?: string }) {
    if (typeof color === "undefined" || typeof kind === "undefined") {
        return "空き";
    }
    return `${colorToString(color)} ${kindToString(kind)}`;
}

@DragSource(
    "piece",
    {
        beginDrag(props: IProps, monitor, component) {
            return { x: props.x, y: props.y, imgSrc: getPieceImage(props), signature: props.kifuStore.signature };
        },
        endDrag(props: IProps, monitor, component) {
            props.kifuStore.onInputMove({ from: monitor.getItem(), to: monitor.getDropResult() });
        },
    },
    function collect(connect, monitor) {
        return {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging(),
        };
    },
)
@DropTarget(
    ["piece", "piecehand"],
    {
        drop(props: IProps, monitor, component) {
            return { x: props.x, y: props.y };
        },
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
    }),
)
@observer
export default class Piece extends React.Component<IProps, any> {
    public render(): React.ReactNode {
        const label = getLabel(this.props.data);
        const div = this.props.connectDropTarget(
            this.props.connectDragSource(
                <div style={{ opacity: this.props.isDragging ? 0.4 : 1 }}>
                    <img src={getPieceImage(this.props)} alt={label} aria-label={label} data-testid={"piece"} />
                </div>,
            ),
        );

        const className = [
            "kifuforjs-cell",
            this.props.lastMove && equalsPos(this.props.lastMove.to, this.props) ? "kifuforjs-cell--lastto" : "",
        ].join(" ");

        return <td className={className}>{div}</td>;
    }
}

function getPieceImage(props) {
    return getUrlWithReverse(props.data, props.kifuStore.reversed);
}

function equalsPos(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}
