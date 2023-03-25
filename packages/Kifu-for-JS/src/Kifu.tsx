import { observer } from "mobx-react";
import * as React from "react";
import { DragDropContext, DropTarget } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import MultiBackend, { Preview } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/lib/HTML5toTouch";

import fscreen from "fscreen";
import MediaQuery from "react-responsive";
import Board from "./Board";
import Control from "./Control";
import Hand from "./Hand";
import Info from "./Info";
import LeftControl from "./LeftControl";
import KifuStore from "./stores/KifuStore";
import { loadFile } from "./utils/util";

import { createRef } from "react";
import "../css/kifuforjs.scss";
import Comment from "./Comment";

// tslint:disable-next-line:no-var-requires
const DevTools = process.env.NODE_ENV !== "production" ? require("mobx-react-devtools").default : () => <span />;

export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;
    responsive?: boolean;

    connectDropTarget?: (element: any) => any; // TODO
}

const PORTRAIT_VIEW_QUERY = "(max-aspect-ratio: 2/3), (max-width: 570px)";

@observer
class Kifu extends React.Component<IProps, { isFullscreen: boolean }> {
    public kifuStore: KifuStore;
    private ref: React.RefObject<HTMLDivElement>;
    private fullscreenListener: number;

    constructor(props) {
        super(props);
        this.kifuStore = props.kifuStore || new KifuStore();
        this.ref = createRef();
        this.state = { isFullscreen: false };
        this.onFullscreenChange = this.onFullscreenChange.bind(this);
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
        if (!this.fullscreenListener) {
            this.fullscreenListener = fscreen.addEventListener("fullscreenchange", this.onFullscreenChange);
        }
    }

    public onFullscreenChange() {
        this.setState({ isFullscreen: !!fscreen.fullscreenElement });
    }

    public componentWillUnmount() {
        if (this.fullscreenListener) {
            fscreen.removeEventListener("fullscreenchange", this.onFullscreenChange);
            this.fullscreenListener = null;
        }
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
                <img src={item.imgSrc} className="kifuforjs-dragPreview" style={style} />
            ) : null;

        const info = <Info player={this.kifuStore.player} />;

        return this.props.connectDropTarget(
            <div className="kifuforjs-wrapper" ref={this.ref}>
                <div
                    className={
                        "kifuforjs" + (this.props.responsive || this.state.isFullscreen ? " kifuforjs--responsive" : "")
                    }
                    style={{ backgroundColor: this.props.isOver ? "silver" : "", position: "relative" }}
                >
                    <Preview generator={previewGenerator} />
                    {/*fscreen.fullscreenEnabled && (
                        <div style={{position: fscreen.fullscreenElement ? "fixed" : "absolute", right: 0, bottom: 0, width: "100px", height: "100px"}}
                             onClick={() => {
                                 if (fscreen.fullscreenElement) {
                                     fscreen.exitFullscreen();
                                 } else {
                                     fscreen.requestFullscreen(this.ref.current);
                                 }
                             }}>
                            {fscreen.fullscreenElement ? "Finish fullscreen" : "Enter fullscreen"}
                        </div>
                    )*/}
                    <DevTools />
                    <div className="kifuforjs-columns">
                        <div className="kifuforjs-column">
                            <Hand kifuStore={this.kifuStore} defaultColor={1} />
                            <MediaQuery query={PORTRAIT_VIEW_QUERY}>
                                {(isPortrait) =>
                                    this.props.responsive && isPortrait ? (
                                        info
                                    ) : (
                                        <LeftControl kifuStore={this.kifuStore} isPortrait={isPortrait} />
                                    )
                                }
                            </MediaQuery>
                        </div>
                        <Board kifuStore={this.kifuStore} />
                        <div className="kifuforjs-column">
                            <MediaQuery query={PORTRAIT_VIEW_QUERY}>
                                {(isPortrait) =>
                                    this.props.responsive && isPortrait ? (
                                        <LeftControl kifuStore={this.kifuStore} isPortrait={isPortrait} />
                                    ) : (
                                        info
                                    )
                                }
                            </MediaQuery>
                            <Hand kifuStore={this.kifuStore} defaultColor={0} />
                        </div>
                    </div>
                    <MediaQuery query={PORTRAIT_VIEW_QUERY}>
                        {(isPortrait) => (
                            <Control kifuStore={this.kifuStore} isPortrait={this.props.responsive && isPortrait} />
                        )}
                    </MediaQuery>

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
