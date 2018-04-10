import { JKFPlayer, Parsers } from "json-kifu-format";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { DragDropContext, DropTarget } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import MultiBackend, { Preview } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/lib/HTML5toTouch";

import Board from "./Board";
import Control from "./Control";
import Hand from "./Hand";
import Info from "./Info";
import LeftControl from "./LeftControl";
import KifuStore from "./stores/KifuStore";
import { loadFile } from "./util";

import DevTools from "mobx-react-devtools";
import "../css/kifuforjs.css";

declare var $; // jQuery

export interface IProps {
    callback?: (callback: (data: string, filename: string) => void) => void;
    kifu?: string;
    isOver?: boolean;

    connectDropTarget?: (element: any) => any; // TODO
}

const FORMAT_ERROR_MESSAGE =
    "棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n";

@observer
class Kifu extends React.Component<IProps, {}> {
    public kifuStore: KifuStore;

    constructor(props) {
        super(props);
        this.kifuStore = new KifuStore();
        this.kifuStore.player = new JKFPlayer({ header: {}, moves: [{}] });

        this.reload = this.reload.bind(this);
    }

    public componentDidMount() {
        if (this.props.callback) {
            this.props.callback((data, filename) => {
                try {
                    this.kifuStore.filename = filename;
                    this.kifuStore.player = JKFPlayer.parse(data, filename);
                } catch (e) {
                    this.logError(FORMAT_ERROR_MESSAGE + data);
                }
            });
        } else {
            try {
                this.kifuStore.player = JKFPlayer.parse(this.props.kifu);
            } catch (e) {
                this.logError(FORMAT_ERROR_MESSAGE + this.props.kifu);
            }
        }
    }

    public componentWillReceiveProps(nextProps) {
        if (this.props.kifu !== nextProps.kifu) {
            try {
                JKFPlayer.log("reload");
                const oldPlayer = this.kifuStore.player;
                const tesuu = oldPlayer.tesuu === oldPlayer.getMaxTesuu() ? Infinity : oldPlayer.tesuu;
                const player = JKFPlayer.parse(nextProps.kifu);
                player.goto(tesuu);
                this.kifuStore.player = player;
            } catch (e) {
                this.logError(FORMAT_ERROR_MESSAGE + this.props.kifu);
            }
        }
    }

    public logError(errs) {
        const move = this.kifuStore.player.kifu.moves[0];
        if (move.comments) {
            move.comments = errs.split("\n").concat(move.comments);
        } else {
            move.comments = errs.split("\n");
        }
    }

    public reload() {
        if (this.props.callback) {
            this.props.callback((data, filename) => {
                JKFPlayer.log("reload");
                const oldPlayer = this.kifuStore.player;
                const tesuu = oldPlayer.tesuu === oldPlayer.getMaxTesuu() ? Infinity : oldPlayer.tesuu;
                const player = JKFPlayer.parse(data, filename);
                player.goto(tesuu);
                this.kifuStore.filename = filename;
                this.kifuStore.player = player;
            });
        }
    }

    public render() {
        const previewGenerator = (type, item, style) =>
            item.signature === this.kifuStore.signature ? (
                <img src={item.imgSrc} className="dragPreview" style={style} />
            ) : null;

        const handClassName =
            "inlineblock players " +
            (this.kifuStore.player.kifu.moves.some((move) => move.forks && move.forks.length > 0) ? "withfork" : "");

        return this.props.connectDropTarget(
            <div>
                <table className="kifuforjs" style={{ backgroundColor: this.props.isOver ? "silver" : "" }}>
                    <tbody>
                        <tr>
                            <td>
                                <Preview generator={previewGenerator} />
                                <DevTools />
                                <div className={handClassName}>
                                    <Hand kifuStore={this.kifuStore} defaultColor={1} />
                                    <LeftControl kifuStore={this.kifuStore} reload={this.reload} />
                                </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                                <Board kifuStore={this.kifuStore} />
                            </td>
                            <td>
                                <div className="inlineblock players">
                                    <Info player={this.kifuStore.player} />
                                    <Hand kifuStore={this.kifuStore} defaultColor={0} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={{ textAlign: "center" }}>
                                <Control kifuStore={this.kifuStore} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>,
        );
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
                        component.kifuStore.player = JKFPlayer.parse(data, name);
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
