/// <reference types="react-dnd" />
import KifuStore, { IOptions } from "../common/stores/KifuStore";
import "./kifuforjs.scss";
export type IProps = {
    isOver?: boolean;
    kifuStore?: KifuStore;
    connectDropTarget?: (element: any) => any;
} & IOptions;
declare const DragDropKifu: __ReactDnd.ContextComponentClass<IProps>;
export default DragDropKifu;
