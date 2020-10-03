import * as React from "react";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
}
export default class ForkList extends React.Component<IProps, any> {
    constructor(props: any);
    render(): JSX.Element;
    private onChange;
}
