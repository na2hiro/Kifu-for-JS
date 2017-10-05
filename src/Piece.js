import React from "react"
import {DragSource, DropTarget} from "react-dnd";

@DragSource("piece", {
    beginDrag: function(props, monitor, component) {
        return {x: props.x, y: props.y, imgSrc: getPieceImage(props), signature: props.signature};
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
                    <div><img src={this.getPieceImage()}
                              style={{opacity: this.props.isDragging?"0.4":"1"}}/>
                    </div>
                ))}
            </td>
        );
    }
    getPieceImage(){
        return getPieceImage(this.props);
    }
}

function getPieceImage(props){
    var color = props.reversed ? 1-props.data.color : props.data.color;
    return props.ImageDirectoryPath+"/"+(!props.data.kind?"blank":color+props.data.kind)+".png";
}

function equalsPos(pos1, pos2) {
    return pos1.x==pos2.x && pos1.y==pos2.y;
}
