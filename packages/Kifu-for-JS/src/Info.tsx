import { JKFPlayer } from "json-kifu-format";
import { observer } from "mobx-react";
import * as React from "react";

export interface IProps {
    player: JKFPlayer;
}

@observer
export default class Info extends React.Component<IProps, {}> {
    public render() {
        const data = this.props.player.kifu.header;
        const dds = [];
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                dds.push(<dt key={"key" + key}>{key}</dt>);
                dds.push(<dd key={"val" + key}>{data[key]}</dd>);
            }
        }

        return (
            <div className="kifuforjs-halfofcolumn kifuforjs-info" tabIndex={0}>
                <dl>{dds}</dl>
            </div>
        );
    }
}
