import { observer } from "mobx-react";
import * as React from "react";
import { Color, colorToString } from "shogi.js";
import PieceHandGroup from "./PieceHandGroup";
import KifuStore from "./stores/KifuStore";
import { colorToMark } from "./utils/util";

export interface IProps {
    kifuStore: KifuStore;
    defaultColor: Color;
}

@observer
export default class Hand extends React.Component<IProps, any> {
    public render() {
        const { reversed, player } = this.props.kifuStore;
        const { defaultColor } = this.props;
        const kinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI"];
        const color = reversed ? 1 - defaultColor : defaultColor;
        const state = player.getState();
        const hand = state.hands[color];
        const playerName = [
            player.kifu.header.先手 || player.kifu.header.下手 || "",
            player.kifu.header.後手 || player.kifu.header.上手 || "",
        ][color];

        const handGroups = kinds
            .reverse()
            .map((kind) => (
                <PieceHandGroup key={kind} value={hand[kind]} data={{ kind, color }} kifuStore={this.props.kifuStore} />
            ));

        return (
            <div
                className={
                    "kifuforjs-halfofcolumn kifuforjs-hand" + (defaultColor === 1 ? " kifuforjs-hand--reverse" : "")
                }
                data-testid={`hand-for-${color}`}
            >
                <div className="kifuforjs-hand-head" aria-label={`${colorToString(color)} ${playerName}の持ち駒`}>
                    {colorToMark(color)}
                    {playerName}
                </div>
                <div className={"kifuforjs-hand-body"}>{handGroups}</div>
            </div>
        );
    }
}
