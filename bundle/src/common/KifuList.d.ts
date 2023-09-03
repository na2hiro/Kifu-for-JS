import { JKFPlayer } from "json-kifu-format";
import * as React from "react";
import { CSSProperties } from "react";
export interface IProps {
    player: JKFPlayer;
    style?: CSSProperties;
    noPositionAbsoluteForSafariBug: boolean;
}
export default class KifuList extends React.Component<IProps> {
    constructor(props: IProps);
    onChange(tesuu: number): void;
    render(): JSX.Element;
}
