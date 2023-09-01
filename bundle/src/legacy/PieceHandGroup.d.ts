import { Component } from "react";
import KifuStore from "../common/stores/KifuStore";
export interface IProps {
    data: any;
    value: number;
    kifuStore: KifuStore;
}
export default class PieceHandGroup extends Component<IProps, any> {
    render(): JSX.Element;
}
