import { observer } from "mobx-react";
import * as React from "react";
import ForkList from "../common/ForkList";
import KifuList from "../common/KifuList";
import KifuStore from "../common/stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
    isPortrait: boolean;
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
            <div className="kifuforjs-halfofcolumn kifuforjs-leftcontrol">
                <KifuList player={player} isPortrait={this.props.isPortrait} />
                <ForkList kifuStore={this.props.kifuStore} />
                <button className="kifuforjs-dl" onClick={this.onClickDl} disabled={!this.clickDlAvailable()}>
                    棋譜保存
                </button>
                <select className="kifuforjs-autoload" onChange={this.onChangeTimer} aria-label="自動更新設定">
                    <option value="NaN">自動更新しない</option>
                    <option value="30">自動更新30秒毎</option>
                    <option value="60">自動更新1分毎</option>
                    <option value="180">自動更新3分毎</option>
                </select>
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
