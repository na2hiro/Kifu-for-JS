import { observer } from "mobx-react";
import * as React from "react";
import { Color } from "shogi.js";
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

        const handGroups = (defaultColor === 0 ? kinds.reverse() : kinds).map((kind) => (
            <PieceHandGroup key={kind} value={hand[kind]} data={{ kind, color }} kifuStore={this.props.kifuStore} />
        ));

        return (
            <div className={"mochi mochi" + color}>
                <div className="tebanname">{colorToMark(color) + playerName}</div>
                <div className="mochimain">{handGroups}</div>
            </div>
        );
    }
}
