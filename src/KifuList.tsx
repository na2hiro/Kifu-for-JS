import * as React from "react";
import {pad} from "./util";

export interface IProps {
    kifu: Array<{comments: string[]; kifu: string; forks: string[]}>; // TODO replace with IJSONKifuFormat
    onChange: (tesuu: number) => void;
    tesuu: number;
}

export default class KifuList extends React.Component<IProps, any> {
    public render() {
        const options = [];
        for (let i = 0; i < this.props.kifu.length; i++) {
            const kifu = this.props.kifu[i];
            options.push(<option key={i} value={i}>
                {(kifu.comments.length > 0 ? "*" : "\xa0") + pad(i.toString(), "\xa0", 3) + " " +
                    kifu.kifu + " " + kifu.forks.join(" ")}
            </option>);
        }
        return <select className="kifulist" size={7} onChange={this.onChange.bind(this)} value={this.props.tesuu}>
            {options}
        </select>;
    }

    public onChange(e) {
        this.props.onChange(e.target.value);
    }
}
