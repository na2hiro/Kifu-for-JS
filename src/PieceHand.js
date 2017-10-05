import React from "react"
import {DropTarget, DragSource} from "react-dnd";

@DragSource("piecehand", {
    beginDrag: function(props, monitor, component) {
        return {piece: props.data.kind, color: props.data.color, imgSrc: getPieceImage(props), signature: props.signature};
    },
    endDrag: function(props, monitor, component){
        props.onInputMove({piece: monitor.getItem().piece, color: monitor.getItem().color, to: monitor.getDropResult()});
    }
}, function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
})
export default class PieceHand extends React.Component {
    render(){
        var style = this.props.position==null
            ? {}
            : {top:0, left: this.props.position, position: "absolute", zIndex:100-this.props.index};
        style.opacity = this.props.isDragging ? "0.4" : "1";
        return (this.props.connectDragSource(
            <div><img src={this.getPieceImage()}
                      style={style}/></div>
        ));
    }
    getPieceImage(){
        return getPieceImage(this.props);
    }
}

function getPieceImage(props){
    var kind = props.data.kind;
    var color = props.reversed ? 1-props.data.color : props.data.color;
    return props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
}

