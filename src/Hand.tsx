import * as React from "react";
import PieceHandGroup from "./PieceHandGroup";
import { colorToMark } from "./util";

export interface IProps {
    reversed: boolean;
    color: number; // TODO: Color?
    playerName: string;
    data: any; // TODO
    ImageDirectoryPath: string;
    onInputMove: (input: any) => void;
    signature: number;
}

export default class Hand extends React.Component<IProps, any> {
    public render() {
        const kinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI"];
        const virtualColor = this.props.reversed ? 1 - this.props.color : this.props.color;

        const handGroups = (virtualColor === 0 ? kinds.reverse() : kinds).map((kind) => (
            <PieceHandGroup
                key={kind}
                value={this.props.data[kind]}
                data={{ kind, color: this.props.color }}
                ImageDirectoryPath={this.props.ImageDirectoryPath}
                onInputMove={this.props.onInputMove}
                reversed={this.props.reversed}
                signature={this.props.signature}
            />
        ));

        return (
            <div className={"mochi mochi" + this.props.color}>
                <div className="tebanname">{colorToMark(this.props.color) + (this.props.playerName || "")}</div>
                <div className="mochimain">{handGroups}</div>
            </div>
        );
    }
}
