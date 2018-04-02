import JKFPlayer from "json-kifu-format";
import * as React from "react";
import { DragDropContext, DropTarget } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import MultiBackend, { Preview } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/lib/HTML5toTouch";

import Board from "./Board";
import ForkList from "./ForkList";
import Hand from "./Hand";
import KifuList from "./KifuList";
import { loadFile, version } from "./util";

import "../css/kifuforjs.css";

declare var $; // jQuery

export interface IProps {
    callback?: (callback: (data: string, filename: string) => void) => void;
    kifu?: string;
    isOver?: boolean;
    ImageDirectoryPath: string;

    connectDropTarget?: (element: any) => any; // TODO
}

export interface IState {
    player: JKFPlayer;
    reversed: boolean;
    filename?: string;
}

const FORMAT_ERROR_MESSAGE =
    "棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n";

class Kifu extends React.Component<IProps, IState> {
    private signature: number;
    private timerAutoload: number;

    constructor(props) {
        super(props);
        this.state = { player: new JKFPlayer({ header: {}, moves: [{}] }), reversed: false };
        this.signature = Math.random();

        this.onClickDl = this.onClickDl.bind(this);
        this.clickDlAvailable = this.clickDlAvailable.bind(this);
        this.onClickReverse = this.onClickReverse.bind(this);
        this.onClickCredit = this.onClickCredit.bind(this);
        this.onChangeKifuList = this.onChangeKifuList.bind(this);
        this.onChangeForkList = this.onChangeForkList.bind(this);
        this.onInputMove = this.onInputMove.bind(this);
        this.onChangeTimer = this.onChangeTimer.bind(this);
        this.onChangeTesuu = this.onChangeTesuu.bind(this);
        this.onClickGoTo = this.onClickGoTo.bind(this);
    }

    public componentDidMount() {
        if (this.props.callback) {
            this.props.callback((data, filename) => {
                try {
                    this.setState({
                        filename,
                        player: JKFPlayer.parse(data, filename),
                    });
                } catch (e) {
                    this.logError(FORMAT_ERROR_MESSAGE + data);
                }
            });
        } else {
            try {
                this.setState({
                    player: JKFPlayer.parse(this.props.kifu),
                });
            } catch (e) {
                this.logError(FORMAT_ERROR_MESSAGE + this.props.kifu);
            }
        }
    }

    public componentWillReceiveProps(nextProps) {
        if (this.props.kifu !== nextProps.kifu) {
            try {
                JKFPlayer.log("reload");
                const tesuu =
                    this.state.player.tesuu === this.state.player.getMaxTesuu() ? Infinity : this.state.player.tesuu;
                const player = JKFPlayer.parse(nextProps.kifu);
                player.goto(tesuu);
                this.setState({
                    player,
                });
            } catch (e) {
                this.logError(FORMAT_ERROR_MESSAGE + this.props.kifu);
            }
        }
    }

    public logError(errs) {
        const move = this.state.player.kifu.moves[0];
        if (move.comments) {
            move.comments = errs.split("\n").concat(move.comments);
        } else {
            move.comments = errs.split("\n");
        }
        this.setState(this.state);
    }

    public reload() {
        if (this.props.callback) {
            this.props.callback((data, filename) => {
                JKFPlayer.log("reload");
                const tesuu =
                    this.state.player.tesuu === this.state.player.getMaxTesuu() ? Infinity : this.state.player.tesuu;
                const player = JKFPlayer.parse(data, filename);
                player.goto(tesuu);
                this.setState({
                    filename,
                    player,
                });
            });
        }
    }

    public onClickDl() {
        if (this.state.filename) {
            window.open(this.state.filename);
        }
    }

    public clickDlAvailable() {
        return this.state.filename;
    }

    public onClickReverse() {
        this.setState({ reversed: !this.state.reversed });
    }

    public onClickCredit() {
        if (
            confirm(`*** CREDIT ***
Kifu for JS (ver. ${version})
    by na2hiro
    under the MIT License

公式サイトを開きますか？`)
        ) {
            window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
        }
    }

    public onChangeKifuList(n) {
        this.goto(n);
    }

    public onChangeForkList(n) {
        this.forkAndForward(n);
    }

    public onInputMove(move) {
        try {
            if (!this.state.player.inputMove(move)) {
                move.promote = confirm("成りますか？");
                this.state.player.inputMove(move);
            }
        } catch (e) {
            // ignore
        }
        this.setState(this.state);
    }

    public forkAndForward(num) {
        this.state.player.forkAndForward(num);
        this.setState(this.state);
    }

    public goto(tesuu: number) {
        if (isNaN(tesuu)) {
            return;
        }
        this.state.player.goto(tesuu);
        this.setState(this.state);
    }

    public go(tesuu) {
        tesuu = Number(tesuu);
        if (isNaN(tesuu)) {
            return;
        }
        this.state.player.go(tesuu);
        this.setState(this.state);
    }

    public render() {
        return this.props.connectDropTarget(
            <table className="kifuforjs" style={{ backgroundColor: this.props.isOver ? "silver" : "" }}>
                <tbody>
                    {this.getFirstRow()}
                    {this.getSecondRow()}
                </tbody>
            </table>,
        );
    }

    // TODO separate into more meaningful parts
    private getFirstRow() {
        const data = this.state.player.kifu.header;
        const dds = [];
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                dds.push(<dt key={"key" + key}>{key}</dt>);
                dds.push(<dd key={"val" + key}>{data[key]}</dd>);
            }
        }
        const info = <dl>{dds}</dl>;

        const state = this.state.player.getState();
        const players = [
            this.state.player.kifu.header.先手 || this.state.player.kifu.header.下手,
            this.state.player.kifu.header.後手 || this.state.player.kifu.header.上手,
        ];
        const reversed = this.state.reversed;
        const previewGenerator = (type, item, style) =>
            item.signature === this.signature ? <img src={item.imgSrc} className="dragPreview" style={style} /> : null;

        const handClassName =
            "inlineblock players " +
            this.state.player.kifu.moves.some((move) => (move.forks && move.forks.length > 0 ? "withfork" : ""));

        const forkListNowMove =
            this.state.player.tesuu < this.state.player.getMaxTesuu()
                ? this.state.player.getReadableKifu(this.state.player.tesuu + 1)
                : null;

        return (
            <tr>
                <td>
                    <Preview generator={previewGenerator} />
                    <div className={handClassName}>
                        <Hand
                            color={reversed ? 0 : 1}
                            data={state.hands[reversed ? 0 : 1]}
                            playerName={players[reversed ? 0 : 1]}
                            ImageDirectoryPath={this.props.ImageDirectoryPath}
                            onInputMove={this.onInputMove}
                            reversed={reversed}
                            signature={this.signature}
                        />
                        <div className="mochi">
                            <KifuList
                                onChange={this.onChangeKifuList}
                                kifu={this.state.player.getReadableKifuState()}
                                tesuu={this.state.player.tesuu}
                            />
                            <ul className="lines">
                                <li className="fork">
                                    <ForkList
                                        onChange={this.onChangeForkList}
                                        forks={this.state.player.getReadableForkKifu()}
                                        nowMove={forkListNowMove}
                                    />
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
                    </div>
                </td>
                <td style={{ textAlign: "center" }}>
                    <Board
                        board={state.board}
                        lastMove={this.state.player.getMove()}
                        ImageDirectoryPath={this.props.ImageDirectoryPath}
                        onInputMove={this.onInputMove}
                        reversed={reversed}
                        signature={this.signature}
                    />
                </td>
                <td>
                    <div className="inlineblock players">
                        <div className="mochi info">{info}</div>
                        <Hand
                            color={reversed ? 1 : 0}
                            data={state.hands[reversed ? 1 : 0]}
                            playerName={players[reversed ? 1 : 0]}
                            ImageDirectoryPath={this.props.ImageDirectoryPath}
                            onInputMove={this.onInputMove}
                            reversed={reversed}
                            signature={this.signature}
                        />
                    </div>
                </td>
            </tr>
        );
    }

    private onChangeTimer(e) {
        if (this.timerAutoload) {
            window.clearInterval(this.timerAutoload);
        }
        const s = parseInt(e.target.value, 10);
        if (!isNaN(s)) {
            this.timerAutoload = window.setInterval(() => {
                this.reload();
            }, s * 1000);
        }
    }

    private getSecondRow() {
        return (
            <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
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
                            <input
                                type="text"
                                name="tesuu"
                                size={3}
                                value={this.state.player.tesuu}
                                onChange={this.onChangeTesuu}
                            />
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
                        value={this.state.player.getComments().join("\n")}
                    />
                </td>
            </tr>
        );
    }

    private onChangeTesuu(e) {
        this.goto(parseInt(e.target.value, 10));
        this.setState(this.state);
    }

    private onClickGoTo(e) {
        if ((e.target as Element).tagName !== "BUTTON") {
            return;
        }
        this.go($(e.target).data("go"));
        this.setState(this.state);
    }
}

const DropTargetKifu = DropTarget<IProps>(
    NativeTypes.FILE,
    {
        drop(props, monitor, component: Kifu) {
            const item = monitor.getItem() as HTMLInputElement;
            if (item.files[0]) {
                loadFile(item.files[0], (data, name) => {
                    try {
                        component.setState({ player: JKFPlayer.parse(data, name) });
                    } catch (e) {
                        component.logError(FORMAT_ERROR_MESSAGE + data);
                    }
                });
            }
        },
    },
    (connect, monitor) => {
        return {
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver(),
        };
    },
)(Kifu);
const DragDropKifu = DragDropContext<IProps>(MultiBackend(HTML5toTouch))(DropTargetKifu);

export default DragDropKifu;
