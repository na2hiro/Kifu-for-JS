import { JKFPlayer } from "json-kifu-format";
import { observer } from "mobx-react";
import * as React from "react";

export interface IProps {
    player: JKFPlayer;
}

@observer
export default class ForkList extends React.Component<IProps, any> {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public render() {
        const { player } = this.props;
        const nowMove = player.tesuu < player.getMaxTesuu() ? player.getReadableKifu(player.tesuu + 1) : null;
        // 分岐
        const forks = this.props.player.getReadableForkKifu();
        let options;
        if (forks.length > 0) {
            options = [
                <option key={nowMove} value="top">
                    {nowMove}
                </option>,
            ].concat(
                forks.map((fork, i) => (
                    <option key={fork} value={i}>
                        {fork}
                    </option>
                )),
            );
        } else {
            options = <option value="top">変化なし</option>;
        }
        return (
            <select className="forklist" value="top" onChange={this.onChange} disabled={forks.length === 0}>
                {options}
            </select>
        );
    }

    private onChange(e) {
        this.props.player.forkAndForward(e.target.value);
    }
}
