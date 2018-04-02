import * as React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { getUrlWithReverse } from "./images/PieceImage";

export interface IProps {
    data: any; // TODO
    lastMove: any; // TODO
    reversed: boolean;
    signature: number;
    x: number;
    y: number;
    onInputMove: (obj: any) => void;

    connectDropTarget?: (obj: any) => Element;
    connectDragSource?: (obj: any) => Element;
    isDragging?: boolean;
}

@DragSource(
    "piece",
    {
        beginDrag(props: IProps, monitor, component) {
            return { x: props.x, y: props.y, imgSrc: getPieceImage(props), signature: props.signature };
        },
        endDrag(props: IProps, monitor, component) {
            props.onInputMove({ from: monitor.getItem(), to: monitor.getDropResult() });
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
        const color = this.props.data.color;

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
    return getUrlWithReverse(props.data.kind, props.data.color, props.reversed);
}

function equalsPos(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}
