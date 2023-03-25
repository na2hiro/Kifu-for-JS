import { observer } from "mobx-react";
import * as React from "react";
import KifuStore from "./stores/KifuStore";

export interface IProps {
    kifuStore: KifuStore;
}

@observer
export default class Comment extends React.Component<IProps> {
    public render() {
        const { player } = this.props.kifuStore;
        return (
            <textarea
                rows={10}
                className="kifuforjs-comment"
                disabled={true}
                value={this.props.kifuStore.errors.join("\n") || player.getComments().join("\n")}
            />
        );
    }
}
