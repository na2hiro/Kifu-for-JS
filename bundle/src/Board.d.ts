import * as React from "react";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
}
export default class Board extends React.Component<IProps, any> {
    render(): JSX.Element;
}
