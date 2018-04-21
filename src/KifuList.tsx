import { JKFPlayer } from "json-kifu-format";
import { observer } from "mobx-react";
import * as React from "react";
import { pad } from "./utils/util";

export interface IProps {
    player: JKFPlayer;
}

@observer
export default class KifuList extends React.Component<IProps, any> {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public render() {
        const options = [];
        const kifuState = this.props.player.getReadableKifuState();
        for (let i = 0; i < kifuState.length; i++) {
            const kifu = kifuState[i];
            const textContent =
                (kifu.comments.length > 0 ? "*" : "\xa0") +
                pad(i.toString(), "\xa0", 3) +
                " " +
                kifu.kifu +
                " " +
                kifu.forks.join(" ");
            options.push(
                <option key={i} value={i}>
                    {textContent}
                </option>,
            );
        }
        return (
            <select className="kifulist" size={7} onChange={this.onChange} value={this.props.player.tesuu}>
                {options}
            </select>
        );
    }

    public onChange(e) {
        this.props.player.goto(e.target.value);
    }
}
