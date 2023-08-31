import { observer } from "mobx-react";
import * as React from "react";
import { DragDropContext, DropTarget } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import MultiBackend, { Preview } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/lib/HTML5toTouch";

import KifuStore, { IOptions } from "../common/stores/KifuStore";
import { loadFile } from "../utils/util";
import Board from "./Board";
import Control from "./Control";
import Hand from "./Hand";
import Info from "./Info";
import LeftControl from "./LeftControl";

import { createRef } from "react";
import "../../css/kifuforjs.scss";
import Comment from "../common/Comment";

export type IProps = {
    isOver?: boolean;
    kifuStore?: KifuStore;

    connectDropTarget?: (element: any) => any; // TODO
} & IOptions;

@observer
class Kifu extends React.Component<IProps> {
    public kifuStore: KifuStore;
    private ref: React.RefObject<HTMLDivElement>;

    constructor(props) {
        super(props);
        const { kifuStore, ...options } = props;
        this.kifuStore = kifuStore || new KifuStore();
        if (Object.keys(options).length > 0) {
            this.kifuStore.setOptions(options);
        }
        this.ref = createRef();
    }

    public render() {
        const previewGenerator = (type, item, style) =>
            item.signature === this.kifuStore.signature ? (
                <img src={item.imgSrc} className="kifuforjs-dragPreview" style={style} />
            ) : null;

        return this.props.connectDropTarget(
            <div className="kifuforjs-wrapper" ref={this.ref}>
                <div
                    className={"kifuforjs"}
                    style={{ backgroundColor: this.props.isOver ? "silver" : "", position: "relative" }}
                >
                    <Preview generator={previewGenerator} />
                    <div className="kifuforjs-columns">
                        <div className="kifuforjs-column">
                            <Hand kifuStore={this.kifuStore} defaultColor={1} />
                            <LeftControl kifuStore={this.kifuStore} />
                        </div>
                        <Board kifuStore={this.kifuStore} />
                        <div className="kifuforjs-column">
                            <Info player={this.kifuStore.player} />
                            <Hand kifuStore={this.kifuStore} defaultColor={0} />
                        </div>
                    </div>
                    <Control kifuStore={this.kifuStore} />

                    <Comment kifuStore={this.kifuStore} />
                </div>
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
                    component.kifuStore.loadKifu(data, name);
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
