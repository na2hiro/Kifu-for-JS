import JKFPlayer from "json-kifu-format";
import * as React from "react";
import Piece from "./Piece";

export interface IProps {
    reversed: boolean;
    board: any[][]; // TODO
    lastMove: any; // TODO
    ImageDirectoryPath: string;
    onInputMove: (obj: any) => void; // TODO
    signature: any; // TODO
}

export default class Board extends React.Component<IProps, any> {
    public render() {
        const nineY = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const nineX = nineY.slice().reverse();

        const ths = nineX.map((logicalX) => {
            const x = this.props.reversed ? 10 - logicalX : logicalX;
            return <th key={x}>{x}</th>;
        });

        const trs = nineY.map((logicalY) => {
            const y = this.props.reversed ? 10 - logicalY : logicalY;
            return <tr key={y}>
                {nineX.map((logicalX) => {
                    const x = this.props.reversed ? 10 - logicalX : logicalX;
                    return (
                        <Piece
                            key={x}
                            data={this.props.board[x - 1][y - 1]}
                            x={x}
                            y={y}
                            lastMove={this.props.lastMove}
                            ImageDirectoryPath={this.props.ImageDirectoryPath}
                            onInputMove={this.props.onInputMove}
                            reversed={this.props.reversed}
                            signature={this.props.signature}/>
                    );
                })}
                <th>{JKFPlayer.numToKan(y)}</th>
            </tr>;
        });

        return (
            <table className="ban">
                <tbody>
                    <tr>{ths}</tr>
                    {trs}
                </tbody>
            </table>
        );
    }
}
