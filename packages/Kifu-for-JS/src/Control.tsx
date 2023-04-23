import { observer } from "mobx-react";
import * as React from "react";
import KifuStore from "./stores/KifuStore";

declare const __VERSION__: string;

export interface IProps {
    kifuStore: KifuStore;
    isPortrait: boolean;
}

@observer
export default class Control extends React.Component<IProps> {
    constructor(props) {
        super(props);
        this.onClickGoTo = this.onClickGoTo.bind(this);
        this.onChangeTesuu = this.onChangeTesuu.bind(this);
        this.onClickReverse = this.onClickReverse.bind(this);
    }
    public render() {
        const { player } = this.props.kifuStore;
        if (this.props.isPortrait) {
            return (
                <div className="kifuforjs-control" onClick={this.onClickGoTo}>
                    <button data-go="-1" className="kifuforjs-control-mainbutton">
                        <div>&lt;</div>
                    </button>
                    <button data-go="1" className="kifuforjs-control-mainbutton">
                        <div>&gt;</div>
                    </button>
                    <button className="kifuforjs-control-tools" onClick={this.onClickReverse}>
                        <div>反転</div>
                    </button>
                    <button className="kifuforjs-control-tools" onClick={this.onClickCredit}>
                        <div>credit</div>
                    </button>
                </div>
            );
        } else {
            return (
                <div className="kifuforjs-control" onClick={this.onClickGoTo}>
                    <button data-go="-Infinity">
                        <div>|&lt;</div>
                    </button>
                    <button data-go="-10">
                        <div>&lt;&lt;</div>
                    </button>
                    <button data-go="-1">
                        <div>&lt;</div>
                    </button>
                    <input
                        type="text"
                        name="tesuu"
                        size={3}
                        value={player.tesuu}
                        onChange={this.onChangeTesuu}
                        aria-label="現在の手数"
                    />
                    <button data-go="1">
                        <div>&gt;</div>
                    </button>
                    <button data-go="10">
                        <div>&gt;&gt;</div>
                    </button>
                    <button data-go="Infinity">
                        <div>&gt;|</div>
                    </button>
                    <button className="kifuforjs-control-tools" onClick={this.onClickReverse}>
                        <div>反転</div>
                    </button>
                    <button className="kifuforjs-control-tools" onClick={this.onClickCredit}>
                        <div>credit</div>
                    </button>
                </div>
            );
        }
    }

    private onClickGoTo(e) {
        const go = Number(e.target.dataset.go || e.target.parentNode.dataset.go);
        if (!isNaN(go)) {
            this.props.kifuStore.player.go(go);
        }
    }

    private onChangeTesuu(e) {
        this.props.kifuStore.player.goto(e.target.value);
    }

    private onClickReverse() {
        this.props.kifuStore.flip();
    }

    /**
     * TODO: import version number from package.json
     */
    private onClickCredit() {
        if (
            confirm(`*** CREDIT ***
Kifu for JS (ver. ${__VERSION__})
    by na2hiro
    under the MIT License

公式サイトを開きますか？`)
        ) {
            window.open("https://github.com/na2hiro/Kifu-for-JS/tree/master/packages/Kifu-for-JS#readme", "kifufile");
        }
    }
}
