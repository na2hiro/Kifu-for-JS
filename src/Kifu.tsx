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
import { loadFile } from "./utils/util";

import "../css/kifuforjs.css";
import Comment from "./Comment";

// tslint:disable-next-line:no-var-requires
const DevTools = process.env.NODE_ENV !== "production" ? require("mobx-react-devtools").default : () => <span />;

export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;

    connectDropTarget?: (element: any) => any; // TODO
}

@observer
class Kifu extends React.Component<IProps, {}> {
    public kifuStore: KifuStore;

    constructor(props) {
        super(props);
        this.kifuStore = props.kifuStore || new KifuStore();
    }

    public componentDidMount() {
        const { filePath } = this.props;
        let loadPromise;
        if (filePath) {
            loadPromise = this.kifuStore.loadFile(filePath);
        } else {
            loadPromise = this.kifuStore.loadKifu(this.props.kifu);
        }
        loadPromise.catch(() => {
            // ok
        });
    }

    public componentWillReceiveProps(nextProps: IProps) {
        let loadPromise = Promise.resolve();
        if (this.props.filePath !== nextProps.filePath) {
            loadPromise = this.kifuStore.loadFile(this.props.filePath);
        } else if (this.props.kifu !== nextProps.kifu) {
            loadPromise = this.kifuStore.loadKifu(this.props.kifu);
        }
        loadPromise.catch(() => {
            // ok
        });
    }

    public render() {
        const previewGenerator = (type, item, style) =>
            item.signature === this.kifuStore.signature ? (
                <img src={item.imgSrc} className="dragPreview" style={style} />
            ) : null;

        return this.props.connectDropTarget(
            <div className="kifuforjs" style={{ backgroundColor: this.props.isOver ? "silver" : "" }}>
                <Preview generator={previewGenerator} />
                <DevTools />
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
