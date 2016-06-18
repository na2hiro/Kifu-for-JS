import PieceHand from "./PieceHand.js";
import React from "react";

export default class PieceHandGroup extends React.Component {
    render(){
        var positioner;
        if(this.props.data.kind=="FU"){
            if(this.props.value>=4){
                positioner = i=>(120-32)*i/(this.props.value-1);
            }
        }else{
            if(this.props.value>=2){
                positioner = i=>(60-32)*i/(this.props.value-1);
            }
        }
        var pieces = [];
        for(var i=0; i<this.props.value; i++){
            pieces.push(<PieceHand key={i} data={this.props.data} ImageDirectoryPath={this.props.ImageDirectoryPath} index={i}
                                   onInputMove={this.props.onInputMove} position={positioner ? positioner(i) : null} reversed={this.props.reversed}/>);
        }
        return (
            <span className={"mochigoma"+(this.props.value==0?"":(this.props.data.kind=="FU" ? " fu":" fu-else"))}>
				{pieces}
			</span>
        );
    }
}
