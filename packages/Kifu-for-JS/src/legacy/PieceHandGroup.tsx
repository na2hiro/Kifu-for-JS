import { Component } from "react";
import * as React from "react";
import { kindToString } from "shogi.js";
import KifuStore from "../common/stores/KifuStore";
import PieceHand from "./PieceHand";

export interface IProps {
    data: any; // TODO
    value: number;
    kifuStore: KifuStore;
}

export default class PieceHandGroup extends Component<IProps, any> {
    public render() {
        let positioner;
        if (this.props.data.kind === "FU") {
            if (this.props.value >= 4) {
                positioner = (i) => ((120 - 32) * i) / (this.props.value - 1);
            }
        } else {
            if (this.props.value >= 2) {
                positioner = (i) => ((60 - 32) * i) / (this.props.value - 1);
            }
        }
        const pieces = [];
        for (let i = 0; i < this.props.value; i++) {
            pieces.push(
                <PieceHand
                    key={i}
                    data={this.props.data}
                    index={i}
                    kifuStore={this.props.kifuStore}
                    position={positioner ? positioner(i) : null}
                />,
            );
        }
        const classNames = ["kifuforjs-pieceinhand"];
        if (this.props.data.kind === "FU") {
            classNames.push("kifuforjs-pieceinhand--fu");
        }
        const label = `${kindToString(this.props.data.kind)}${this.props.value > 1 ? `${this.props.value}枚` : ``}`;

        return (
            <div data-testid="piece-in-hand" className={classNames.join(" ")} role="img" aria-label={label}>
                {pieces}
            </div>
        );
    }
}
