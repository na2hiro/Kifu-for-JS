import { JKFPlayer } from "json-kifu-format";
import * as React from "react";
export interface IProps {
    player: JKFPlayer;
}
export default class KifuList extends React.Component<IProps, any> {
    constructor(props: any);
    render(): JSX.Element;
    onChange(e: any): void;
}
