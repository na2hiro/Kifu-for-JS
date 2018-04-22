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
            <div>
                <ul className="inline go" style={{ margin: "0 auto" }} onClick={this.onClickGoTo}>
                    <li>
                        <button data-go="-Infinity">|&lt;</button>
                    </li>
                    <li>
                        <button data-go="-10">&lt;&lt;</button>
                    </li>
                    <li>
                        <button data-go="-1">&lt;</button>
                    </li>
                    <li>
                        <input type="text" name="tesuu" size={3} value={player.tesuu} onChange={this.onChangeTesuu} />
                    </li>
                    <li>
                        <button data-go="1">&gt;</button>
                    </li>
                    <li>
                        <button data-go="10">&gt;&gt;</button>
                    </li>
                    <li>
                        <button data-go="Infinity">&gt;|</button>
                    </li>
                </ul>
                <ul className="inline tools">
                    <li>
                        <button onClick={this.onClickReverse}>反転</button>
                    </li>
                    <li>
                        <button onClick={this.onClickCredit}>credit</button>
                    </li>
                </ul>
                <textarea
                    rows={10}
                    className="comment"
                    disabled={true}
                    value={this.props.kifuStore.errors.join("\n") || player.getComments().join("\n")}
                />
            </div>
        );
    }

    private onClickGoTo(e) {
        if ((e.target as Element).tagName !== "BUTTON") {
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
Kifu for JS (ver. 2.0.0)
    by na2hiro
    under the MIT License

公式サイトを開きますか？`)
        ) {
            window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
        }
    }
}
