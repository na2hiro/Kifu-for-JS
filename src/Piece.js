import React from "react"
import {DropTarget, DragSource} from "react-dnd";

var Piece = DragSource("piece", {
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
})(DropTarget(["piece", "piecehand"], {
    drop: function(props, monitor, component) {
        return {x: props.x, y: props.y};
    },
}, function collect(connect, monitor){
    return {
        connectDropTarget: connect.dropTarget()
    };
})(React.createClass({
    render: function(){
        var color = this.props.data.color;
        return (
            <td className={this.props.lastMove && this.props.lastMove.to.x==this.props.x && this.props.lastMove.to.y==this.props.y ? "lastto" : "" }>
                {this.props.connectDropTarget(this.props.connectDragSource(
                    <div><img src={this.getPieceImage(this.props.data.kind, this.props.reversed?1-color:color)} style={{visibility: this.props.isDragging?"hidden":""}} /></div>
                ))}
            </td>
        );
    },
    getPieceImage: function(kind, color){
        return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
    },
})));

export default Piece;
