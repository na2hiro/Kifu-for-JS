import * as React from "react";
import { Color } from "shogi.js";
import KifuStore from "./stores/KifuStore";
export interface IProps {
    kifuStore: KifuStore;
    defaultColor: Color;
}
export default class Hand extends React.Component<IProps, any> {
    render(): JSX.Element;
}
