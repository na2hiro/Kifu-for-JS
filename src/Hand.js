import React from "react";
import PieceHandGroup from "./PieceHandGroup.js";
import {colorToMark} from "./util.js";

export default class Hand extends React.Component {
    render(){
        var kinds = ["FU","KY","KE","GI","KI","KA","HI"];
        var virtualColor = this.props.reversed ? 1-this.props.color : this.props.color;
        return (
            <div className={"mochi mochi"+this.props.color}>
                <div className="tebanname">{colorToMark(this.props.color)+(this.props.playerName||"")}</div>
                <div className="mochimain">
                    {(virtualColor==0 ? kinds.reverse() : kinds).map((kind)=>
                        <PieceHandGroup key={kind} value={this.props.data[kind]} data={{kind: kind, color: this.props.color}} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.props.onInputMove} reversed={this.props.reversed}/>
                    )}
                </div>
            </div>
        );
    }
}
