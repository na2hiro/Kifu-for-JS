import { observer } from "mobx-react";
import * as React from "react";
import ForkList from "./ForkList";
import KifuList from "./KifuList";
import KifuStore from "./stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
}

@observer
export default class LeftControl extends React.Component<IProps, {}> {
    constructor(props) {
        super(props);
        this.onClickDl = this.onClickDl.bind(this);
        this.clickDlAvailable = this.clickDlAvailable.bind(this);
        this.onChangeTimer = this.onChangeTimer.bind(this);
    }

    public render() {
        const { player } = this.props.kifuStore;
        return (
            <div className="mochi panel">
                <KifuList player={player} />
                <ul className="lines">
                    <li className="fork">
                        <ForkList kifuStore={this.props.kifuStore} />
                    </li>
                    <li>
                        <button className="dl" onClick={this.onClickDl} disabled={!this.clickDlAvailable()}>
                            棋譜保存
                        </button>
                    </li>
                    <li>
                        <select className="autoload" onChange={this.onChangeTimer}>
                            <option value="NaN">自動更新しない</option>
                            <option value="30">自動更新30秒毎</option>
                            <option value="60">自動更新1分毎</option>
                            <option value="180">自動更新3分毎</option>
                        </select>
                    </li>
                </ul>
            </div>
        );
    }

    public onClickDl() {
        if (this.props.kifuStore.filePath) {
            window.open(this.props.kifuStore.filePath);
        }
    }

    public clickDlAvailable() {
        return this.props.kifuStore.filePath;
    }

    private onChangeTimer(e) {
        this.props.kifuStore.setReloadInterval(e.target.value);
    }
}
