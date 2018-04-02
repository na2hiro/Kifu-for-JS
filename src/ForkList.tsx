import * as React from "react";

export interface IProps {
    forks: string[];
    onChange: (value: number) => void;
    nowMove: string;
}

export default class ForkList extends React.Component<IProps, any> {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public render() {
        // 分岐
        const forks = this.props.forks;
        let options;
        if (forks.length > 0) {
            options = [
                <option key={this.props.nowMove} value="top">
                    {this.props.nowMove}
                </option>,
            ].concat(
                forks.map((fork, i) => (
                    <option key={fork} value={i}>
                        {fork}
                    </option>
                )),
            );
        } else {
            options = <option value="top">変化なし</option>;
        }
        return (
            <select className="forklist" value="top" onChange={this.onChange} disabled={forks.length === 0}>
                {options}
            </select>
        );
    }

    private onChange(e) {
        this.props.onChange(parseInt(e.target.value, 10));
    }
}
