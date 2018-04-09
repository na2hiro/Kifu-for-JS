import { observer } from "mobx-react";
import * as React from "react";
import ForkList from "./ForkList";
import KifuList from "./KifuList";
import KifuStore from "./stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
    reload: () => void;
}

@observer
export default class LeftControl extends React.Component<IProps, {}> {
    private timerAutoload: number;

    constructor(props) {
        super(props);
        this.onClickDl = this.onClickDl.bind(this);
        this.clickDlAvailable = this.clickDlAvailable.bind(this);
        this.onChangeTimer = this.onChangeTimer.bind(this);
    }

    public render() {
        const { player } = this.props.kifuStore;
        return (
            <div className="mochi">
                <KifuList player={player} />
                <ul className="lines">
                    <li className="fork">
                        <ForkList player={player} />
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
        if (this.props.kifuStore.filename) {
            window.open(this.props.kifuStore.filename);
        }
    }

    public clickDlAvailable() {
        return this.props.kifuStore.filename;
    }

    private onChangeTimer(e) {
        if (this.timerAutoload) {
            window.clearInterval(this.timerAutoload);
        }
        const s = parseInt(e.target.value, 10);
        if (!isNaN(s)) {
            this.timerAutoload = window.setInterval(() => {
                this.props.reload();
            }, s * 1000);
        }
    }
}
