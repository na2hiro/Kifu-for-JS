import { observer } from "mobx-react";
import * as React from "react";
import KifuStore from "./stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
}

@observer
export default class ForkList extends React.Component<IProps, any> {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public render() {
        const { player } = this.props.kifuStore;
        const nowMove = player.tesuu < player.getMaxTesuu() ? player.getReadableKifu(player.tesuu + 1) : null;
        // 分岐
        const forks = player.getReadableForkKifu();
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
            this.props.kifuStore.hasFork && (
                <select className="forklist" value="top" onChange={this.onChange} disabled={forks.length === 0}>
                    {options}
                </select>
            )
        );
    }

    private onChange(e) {
        this.props.kifuStore.player.forkAndForward(e.target.value);
    }
}
