/// <reference types="react-dnd" />
import KifuStore from "./stores/KifuStore";
import "../css/kifuforjs.css";
export interface IProps {
    filePath?: string;
    kifu?: string;
    isOver?: boolean;
    kifuStore?: KifuStore;
    connectDropTarget?: (element: any) => any;
}
declare const DragDropKifu: __ReactDnd.ContextComponentClass<IProps>;
export default DragDropKifu;
