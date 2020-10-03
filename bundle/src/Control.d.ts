import * as React from "react";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
}
export default class Control extends React.Component<IProps> {
    constructor(props: any);
    render(): JSX.Element;
    private onClickGoTo;
    private onChangeTesuu;
    private onClickReverse;
    /**
     * TODO: import version number from package.json
     */
    private onClickCredit;
}
