import * as React from "react";

export interface IProps {
    forks: string[];
    onChange: (value: number) => void;
    nowMove: string;
}

export default class ForkList extends React.Component<IProps, any> {
    public render() {
        // 分岐
        const forks = this.props.forks;
        return (
            <select className="forklist" value="top" onChange={(e) => {
                this.props.onChange(parseInt(e.target.value, 10));
            }} ref="select" disabled={forks.length === 0}>
                {forks.length > 0
                    ? [<option key={this.props.nowMove} value="top">{this.props.nowMove}</option>].concat(
                        forks.map((fork, i) => <option key={fork} value={i}>{fork}</option>))
                    : <option value="top">変化なし</option>}
            </select>
        );
    }
}
