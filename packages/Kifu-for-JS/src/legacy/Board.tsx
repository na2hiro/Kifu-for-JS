import { JKFPlayer } from "json-kifu-format";
import { observer } from "mobx-react";
import * as React from "react";
import KifuStore from "../common/stores/KifuStore";
import Piece from "./Piece";

export interface IProps {
    kifuStore: KifuStore;
}

@observer
export default class Board extends React.Component<IProps, any> {
    public render() {
        const {
            reverseMode: { isReversed },
            player,
        } = this.props.kifuStore;
        const board = player.getState().board;
        const lastMove = player.getMove();
        const nineY = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const nineX = nineY.slice().reverse();

        const ths = nineX.map((logicalX) => {
            const x = isReversed ? 10 - logicalX : logicalX;
            return <th key={x}>{x}</th>;
        });

        const trs = nineY.map((logicalY) => {
            const y = isReversed ? 10 - logicalY : logicalY;
            const pieces = nineX.map((logicalX) => {
                const x = isReversed ? 10 - logicalX : logicalX;
                return (
                    <Piece
                        key={x}
                        data={board[x - 1][y - 1]}
                        x={x}
                        y={y}
                        lastMove={lastMove}
                        kifuStore={this.props.kifuStore}
                    />
                );
            });
            return (
                <tr key={y}>
                    {pieces}
                    <th>{JKFPlayer.numToKan(y)}</th>
                </tr>
            );
        });

        return (
            <table className="kifuforjs-board" data-testid="board">
                <tbody>
                    <tr>{ths}</tr>
                    {trs}
                </tbody>
            </table>
        );
    }
}
