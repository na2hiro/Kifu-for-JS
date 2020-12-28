import { observer } from "mobx-react";
import * as React from "react";
import KifuStore from "./stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
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
        return (
            <div className="kifuforjs-control" onClick={this.onClickGoTo}>
                <button data-go="-Infinity">|&lt;</button>
                <button data-go="-10">&lt;&lt;</button>
                <button data-go="-1">&lt;</button>
                <input type="text" name="tesuu" size={3} value={player.tesuu} onChange={this.onChangeTesuu} />
                <button data-go="1">&gt;</button>
                <button data-go="10">&gt;&gt;</button>
                <button data-go="Infinity">&gt;|</button>
                <button className="kifuforjs-control-tools" onClick={this.onClickReverse}>反転</button>
                <button className="kifuforjs-control-tools" onClick={this.onClickCredit}>credit</button>
            </div>
        );
    }

    private onClickGoTo(e) {
        if ((e.target as Element).tagName !== "BUTTON" || !e.target.dataset.go) {
            return;
        }
        this.props.kifuStore.player.go(e.target.dataset.go);
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
Kifu for JS (ver. 2.1.6)
    by na2hiro
    under the MIT License

公式サイトを開きますか？`)
        ) {
            window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
        }
    }
}
