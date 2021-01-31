import * as React from "react";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
}
export default class Comment extends React.Component<IProps> {
    render(): JSX.Element;
}
