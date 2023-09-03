import * as React from "react";
import KifuStore from "../common/stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
}
export default class LeftControl extends React.Component<IProps> {
    constructor(props: IProps);
    render(): JSX.Element;
    onClickDl(): void;
    clickDlAvailable(): string;
    private onChangeTimer;
}
