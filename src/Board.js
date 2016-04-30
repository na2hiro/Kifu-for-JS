import Piece from "./Piece.js";
import React from "react"
import JKFPlayer from "json-kifu-format";

export default class Board extends React.Component {
    render(){
        var nineY = [1,2,3,4,5,6,7,8,9];
        var nineX = nineY.slice().reverse();
        return (
            <table className="ban">
                <tbody>
                <tr>{nineX.map((logicalX)=>{
                    var x = this.props.reversed ? 10-logicalX : logicalX;
                    return <th key={x}>{x}</th>;
                })}</tr>
                {nineY.map((logicalY)=>{
                    var y = this.props.reversed ? 10-logicalY : logicalY;
                    return <tr key={y}>
                        {nineX.map((logicalX)=>{
                            var x = this.props.reversed ? 10-logicalX : logicalX;
                            return <Piece key={x} data={this.props.board[x-1][y-1]} x={x} y={y} lastMove={this.props.lastMove} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.props.onInputMove} reversed={this.props.reversed} />
                        })}
                        <th>{JKFPlayer.numToKan(y)}</th>
                    </tr>;
                })}
                </tbody>
            </table>
        );
    }
}
