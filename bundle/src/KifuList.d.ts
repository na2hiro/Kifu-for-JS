import { JKFPlayer } from "json-kifu-format";
import * as React from "react";
export interface IProps {
    player: JKFPlayer;
    isPortrait: boolean;
}
export default class KifuList extends React.Component<IProps, any> {
    constructor(props: any);
    onChange(tesuu: number): void;
    render(): JSX.Element;
}
