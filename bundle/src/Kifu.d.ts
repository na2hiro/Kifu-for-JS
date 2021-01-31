/// <reference types="react-dnd" />
import KifuStore from "./stores/KifuStore";
import "../css/kifuforjs.scss";
export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;
    responsive?: boolean;
    connectDropTarget?: (element: any) => any;
}
declare const DragDropKifu: __ReactDnd.ContextComponentClass<IProps>;
export default DragDropKifu;
