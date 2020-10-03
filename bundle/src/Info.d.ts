import { JKFPlayer } from "json-kifu-format";
import * as React from "react";
export interface IProps {
    player: JKFPlayer;
}
export default class Info extends React.Component<IProps, {}> {
    render(): JSX.Element;
}
