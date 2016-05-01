import React from "react";
import {pad} from "../util.js"

export default class KifuList extends React.Component {
    render(){
        var options = [];
        for(var i=0; i<this.props.kifu.length; i++){
            var kifu = this.props.kifu[i];
            options.push(<option key={i} value={i}>
                {(kifu.comments.length>0?"*":"\xa0")+pad(i.toString(),"\xa0", 3)+" "+kifu.kifu+" "+kifu.forks.join(" ")}
            </option>);
        }
        return <select className="kifulist" size="7" onChange={this.onChange.bind(this)} value={this.props.tesuu}>
            {options}
        </select>;
    }
    onChange(e){
        this.props.onChange(e.target.value);
    }
}
