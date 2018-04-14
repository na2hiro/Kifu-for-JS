import { observer } from "mobx-react";
import * as React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { Color } from "shogi.js";
import { getUrlWithReverse } from "./images/PieceImage";
import KifuStore from "./stores/KifuStore";

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

@observer
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
export default class Piece extends React.Component<IProps, any> {
    public render(): React.ReactNode {
        const div = this.props.connectDropTarget(
            this.props.connectDragSource(
                <div>
                    <img src={getPieceImage(this.props)} style={{ opacity: this.props.isDragging ? 0.4 : 1 }} />
                </div>,
            ),
        );

        return (
            <td className={this.props.lastMove && equalsPos(this.props.lastMove.to, this.props) ? "lastto" : ""}>
                {div}
            </td>
        );
    }
}

function getPieceImage(props) {
    return getUrlWithReverse(props.data, props.kifuStore.reversed);
}

function equalsPos(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}
