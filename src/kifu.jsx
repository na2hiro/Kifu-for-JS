var KifuForJS = (function(){
var Board = React.createClass({
	render: function(){
		var trs = [];
		var tds = [<th></th>];
		for(var i=1; i<=9; i++){
			tds.unshift(<th>{i}</th>);
		}
		trs.push(tds);
		var lastTo = this.props.lastMove ? this.props.lastMove.to : {};
		for(var j=1; j<=9; j++){
			var tds = [];
			tds.push(<th>{numToKanji(j)}</th>);
			for(var i=1; i<=9; i++){
				tds.unshift(<Piece data={this.props.board[i-1][j-1]} lastFlag={lastTo.x==i&&lastTo.y==j} ImageDirectoryPath={this.props.ImageDirectoryPath} />);
			}
			trs.push(<tr>{tds}</tr>);
		}
		return (
			<table className="ban">
				<tbody>{trs}</tbody>
			</table>
		);
	},
});
var Hand = React.createClass({
	render: function(){
		var doms = ["FU","KY","KE","GI","KI","KA","HI"].map(function(kind){
			return <PieceHand value={this.props.data[kind]} data={{kind: kind, color: this.props.color}} ImageDirectoryPath={this.props.ImageDirectoryPath} />;
		}.bind(this));
		return (
			<div className={"mochi mochi"+this.props.color}>
				<div className="tebanname">{colorToMark(this.props.color)}</div>
				<div className="mochimain">{doms}</div>
			</div>
		);
	},
});
var PieceHand = React.createClass({
	render: function(){
		var classNames = ["mochigoma", "mochi_"+this.props.kind, this.props.value<=1?"mai"+this.props.value:""];
		return (
			<span className={classNames.join(" ")}>
				<img src={this.getPieceImage(this.props.data.kind, this.props.data.color)} />
				<span className='maisuu'>{numToKanji(this.props.value)}</span>
			</span>
		);
	},
	getPieceImage: function(kind, color){
		return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
	},
});
var Piece = React.createClass({
	render: function(){
		return (
			<td className={this.props.lastFlag?"lastto":""}>
				<img src={this.getPieceImage(this.props.data.kind, this.props.data.color)} />
			</td>
		);
	},
	getPieceImage: function(kind, color){
		return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
	},
});
var KifuList = React.createClass({
	render: function(){
		var options = [];
		for(var i=0; i<this.props.kifu.length; i++){
			var kifu = this.props.kifu[i];
			options.push(<option value={i}>{(kifu.comments.length>0?"*":"\xa0")+pad(i.toString(),"\xa0", 3)+" "+kifu.kifu+" "+kifu.forks.join(" ")}</option>);
		}
		return <select className="kifulist" size="7" onChange={this.onChange} value={this.props.tesuu}>{options}</select>;
	},
	onChange: function(e){
		this.props.onChange(e.target.value);
	},
});
var ForkList = React.createClass({
	render: function(){
		// 分岐
		var forks = this.props.forks;
		var options = [];
		if(forks.length>0){
			options.push(<option value="top">{this.props.nowMove}</option>);
			forks.forEach(function(fork, i){
				options.push(<option value={i}>{fork}</option>);
			});
		}else{
			options.push(<option value="top">変化なし</option>);
		}
		return (
			<select className="forklist" value="top" onChange={function(){
				this.props.onChange(this.refs.select.getDOMNode().value)
			}.bind(this)} ref="select" disabled={forks.length==0}>
				{options}
			</select>
		);
	}
});
var Kifu = React.createClass({
	componentDidMount: function(){
		ajax(this.props.filename, function(data){
			try{
				console.log(this.props.filename)
				this.setState({player: JKFPlayer.parse(data, this.props.filename)});
			}catch(e){
				alert("棋譜ファイルが異常です: "+e);
				throw e;
			}
		}.bind(this));
	},
	reload: function(){
		ajax(this.props.filename, function(data){
			JKFPlayer.log("reload");
			var tesuu = this.state.player.tesuu == this.state.player.getMaxTesuu() ? Infinity : this.state.player.tesuu;
			var player = JKFPlayer.parse(data, this.filename);
			player.goto(tesuu);
			this.setState({player: player});
		});
	},
	getInitialState: function(){
		return {player: new JKFPlayer({header: {}, moves: [{}]})};
	},
	onClickDl: function(){
		if(this.filename) window.open(this.filename);
	},
	onClickCredit: function(){
		if(confirm("*** CREDIT ***\nKifu for JS (ver. "+Kifu.version+")\n    by na2hiro\n    under the MIT License\n\n公式サイトを開きますか？")){
			window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
		}
	},
	onChangeKifuList: function(n){
		this.goto(n);
	},
	onChangeForkList: function(n){
		this.forkAndForward(n);
	},
	forkAndForward: function(num){
		this.state.player.forkAndForward(num);
		this.setState(this.state);
	},
	goto: function(tesuu){
		if(isNaN(tesuu)) return;
		this.state.player.goto(tesuu);
		this.setState(this.state);
	},
	go: function(tesuu){
		if(tesuu=="start"){
			this.state.player.goto(0);
		}else if(tesuu=="end"){
			this.state.player.goto(Infinity);
		}else{
			tesuu = parseInt(tesuu);
			if(isNaN(tesuu)) return;
			this.state.player.go(tesuu);
			this.setState(this.state);
		}
	},
	render: function(){
		var data = this.state.player.kifu.header;
		var dds = [];
		for(var key in data){
			dds.push(<dt>{key}</dt>);
			dds.push(<dd>{data[key]}</dd>);
		}
		var info = <dl>{dds}</dl>;

		var state = this.state.player.getState();

		window.player = (this.state.player);
		return (
			<table className="kifuforjs">
				<tbody>
					<tr>
						<td>
							<div className={"inlineblock players "+(this.state.player.kifu.moves.some(function(move){return move.forks&&move.forks.length>0;})?"withfork":"")}>
								<Hand color={1} data={state.hands[1]} playerName={this.state.player.kifu.header["後手"] || this.state.player.kifu.header["上手"]} ImageDirectoryPath={this.props.ImageDirectoryPath}/>
								<div className="mochi">
									<KifuList onChange={this.onChangeKifuList} kifu={this.state.player.getReadableKifuState()} tesuu={this.state.player.tesuu} />
									<ul className="lines">
										<li className="fork">
											<ForkList onChange={this.onChangeForkList} forks={this.state.player.getReadableForkKifu()} nowMove={this.state.player.tesuu<this.state.player.getMaxTesuu() ? this.state.player.getReadableKifu(this.state.player.tesuu+1) : null} />
										</li>
										<li><button className="dl" onClick={this.onClickDl}>棋譜保存</button></li>

										<li>
											<select className="autoload">
												<option value="0">自動更新しない</option>
												<option value="30">自動更新30秒毎</option>
												<option value="60">自動更新1分毎</option>
												<option value="180">自動更新3分毎</option>
											</select>
										</li>
									</ul>
								</div>
							</div>
						</td>
						<td style={{textAlign:"center"}}>
							<Board board={this.state.player.getBoardState()} lastMove={this.state.player.getMove()} ImageDirectoryPath={this.props.ImageDirectoryPath} />
						</td>
						<td>
							<div className="inlineblock players">
								<div className="mochi info">
									{info}
								</div>
								<Hand color={0} data={state.hands[0]} playerName={this.state.player.kifu.header["先手"] || this.state.player.kifu.header["下手"]} ImageDirectoryPath={this.props.ImageDirectoryPath}/>
							</div>
						</td>
					</tr>
					<tr>
						<td colSpan="3" style={{textAlign:"center"}}>
							<ul className="inline go" style={{margin:"0 auto"}} onClick={function(e){
										if(e.target.tagName!="BUTTON") return;
										this.go(e.target.dataset.go);
										this.setState(this.state);
									}.bind(this)}>
								<li><button data-go="start">|&lt;</button></li>
								<li><button data-go="-10">&lt;&lt;</button></li>
								<li><button data-go="-1">&lt;</button></li>
								<li>
									<input type="text" name="tesuu" size="3" style={{textAlign:"center"}} ref="tesuu" value={this.state.player.tesuu} onChange={function(e){
											this.goto(e.target.value);
											this.setState(this.state);
										}.bind(this)} />
								</li>
								<li><button data-go="1">&gt;</button></li>
								<li><button data-go="10">&gt;&gt;</button></li>
								<li><button data-go="end">&gt;|</button></li>
							</ul>
							<ul className="inline">
								<li><button className="credit" onClick={this.onClickCredit}>credit</button></li>
							</ul>
							<textarea rows="10" className="comment" disabled value={this.state.player.getComments().join("\n")}></textarea>
						</td>
					</tr>
				</tbody>
			</table>
		);
	
		$("select.autoload", this.id).change(function(){
			if(that.timerAutoload){
				clearInterval(that.timerAutoload);
			}
			var s = parseInt($(this).val());
			if(!isNaN(s) && s>0){
				that.timerAutoload = setInterval(function(){
					that.reload();
				}, s*1000);
			}
		});
		
		if(show) this.show();
	}
});

/*function Kifu(id){
	this.id="#"+id;
}*/
var version = "1.0.6";
var settings = {};
function load(filename, id){
	if(!id){
		id = "kifuforjs_"+Math.random().toString(36).slice(2);
		document.write("<div id='"+id+"'></div>");
	}
/*	var kifu = new Kifu(id);
	$(document).ready(function(){
	});
	return kifu;*/
};
function ajax(filename, onSuccess){
	var tmp = filename.split("."), ext = tmp[tmp.length-1];
	var encoding = ["jkf", "kifu", "ki2u"].indexOf(ext)>=0 ? "UTF-8" : "Shift_JIS";
	$.ajax(filename, {
		success: function(data, textStatus){
			if(textStatus=="notmodified"){
				console.log("kifu not modified");
				return;
			}
			onSuccess(data);
		},
		error: function(jqXHR, textStatus, errorThrown){
			if(textStatus!="notmodified"){
				alert("棋譜の取得に失敗しました: "+filename);
			}
		},
		beforeSend: function(xhr){
			xhr.overrideMimeType("text/html;charset="+encoding);
		},
		ifModified: true,
	});
};

var lastForkDepth = 0;
var timerAutoload;
	//盤面を再生した後に吐き出す
		/*
		var nowComments = this.player.getComments();
		var nowMove = this.player.getMove();
		if(this.player.tesuu==this.player.getMaxTesuu()){
			//最終手に動きがない(≒specialである)場合は直前の一手を採用
			if(nowComments.length==0) nowComments = this.player.getComments(this.player.tesuu-1);
			if(!nowMove) nowMove = this.player.getMove(this.player.tesuu-1);
		}
		// Modelへ移動
		*/

function numToKanji(n){
	return "〇一二三四五六七八九"[n];
}
function colorToMark(color){
	return color==Color.Black ? "☗" : "☖";
}
// length <= 10
function pad(str, space, length){
	var ret = "";
	for(var i=str.length; i<length; i++){
		ret+=space;
	}
	return ret+str;
}
return Kifu;
})();
