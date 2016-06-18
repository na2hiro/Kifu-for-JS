import React from "react"
import {DropTarget, DragSource} from "react-dnd";

@DragSource("piece", {
    beginDrag: function(props, monitor, component) {
        return {x: props.x, y: props.y};
    },
    endDrag: function(props, monitor, component){
        props.onInputMove({from: monitor.getItem(), to: monitor.getDropResult()});
    }
}, function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
})
@DropTarget(["piece", "piecehand"], {
    drop: function(props, monitor, component) {
        return {x: props.x, y: props.y};
    },
}, function collect(connect, monitor){
    return {
        connectDropTarget: connect.dropTarget()
    };
})
export default class Piece extends React.Component {
    render(){
        var color = this.props.data.color;
        return (
            <td className={this.props.lastMove && equalsPos(this.props.lastMove.to, this.props) ? "lastto" : "" }>
                {this.props.connectDropTarget(this.props.connectDragSource(
                    <div><img src={this.getPieceImage(this.props.data.kind, this.props.reversed?1-color:color)}
                              style={{visibility: this.props.isDragging?"hidden":""}} /></div>
                ))}
            </td>
        );
    }
    getPieceImage(kind, color){
        return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
    }
}

function equalsPos(pos1, pos2) {
    return pos1.x==pos2.x && pos1.y==pos2.y;
}
