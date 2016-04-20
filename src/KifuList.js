import React from "react";
import {pad} from "./util.js"

var KifuList = React.createClass({
    render: function(){
        var options = [];
        for(var i=0; i<this.props.kifu.length; i++){
            var kifu = this.props.kifu[i];
            options.push(<option key={i} value={i}>{(kifu.comments.length>0?"*":"\xa0")+pad(i.toString(),"\xa0", 3)+" "+kifu.kifu+" "+kifu.forks.join(" ")}</option>);
        }
        return <select className="kifulist" size="7" onChange={this.onChange} value={this.props.tesuu}>{options}</select>;
    },
    onChange: function(e){
        this.props.onChange(e.target.value);
    },
});
export default KifuList;
