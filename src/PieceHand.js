import React from "react"
import {DropTarget, DragSource} from "react-dnd";

var PieceHand = DragSource("piecehand", {
    beginDrag: function(props, monitor, component) {
        return {piece: props.data.kind, color: props.data.color};
    },
    endDrag: function(props, monitor, component){
        props.onInputMove({piece: monitor.getItem().piece, color: monitor.getItem().color, to: monitor.getDropResult()});
    }
}, function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
})(React.createClass({
    render: function(){
        var virtualColor = this.props.reversed ? 1-this.props.data.color : this.props.data.color;
        var style = this.props.position==null
            ? {}
            : {top:0, left: this.props.position, position: "absolute", zIndex:100-this.props.index};
        return (this.props.connectDragSource(
            <div><img src={this.getPieceImage(this.props.data.kind, virtualColor)}
                      style={style}/></div>
        ));
    },
    getPieceImage: function(kind, color){
        return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
    },
}));

export default PieceHand;
