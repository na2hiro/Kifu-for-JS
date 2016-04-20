import React from "react"

var ForkList = React.createClass({
    render: function(){
        // 分岐
        var forks = this.props.forks;
        return (
            <select className="forklist" value="top" onChange={function(){
				this.props.onChange(this.refs.select.getDOMNode().value)
			}.bind(this)} ref="select" disabled={forks.length==0}>
                {forks.length>0
                    ? [<option key={this.props.nowMove} value="top">{this.props.nowMove}</option>].concat(forks.map(function(fork, i){
                    return <option key={fork} value={i}>{fork}</option>;
                }))
                    : <option value="top">変化なし</option>}
            </select>
        );
    }
});
export default ForkList;
