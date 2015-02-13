var Kifu= (function(){
var version = "1.0.8";
var DragDropMixin = ReactDND.DragDropMixin;
var Board = React.createClass({
	render: function(){
		var nineY = [1,2,3,4,5,6,7,8,9];
		var nineX = nineY.slice().reverse();
		return (
			<table className="ban">
				<tbody>
					<tr>{nineX.map(function(x){return <th>{x}</th>;})}</tr>
					{nineY.map(function(y){
						return <tr>
							{nineX.map(function(x){
								return <Piece data={this.props.board[x-1][y-1]} x={x} y={y} lastMove={this.props.lastMove} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.props.onInputMove} />
							}.bind(this))}
							<th>{numToKanji(y)}</th>
						</tr>;
					}.bind(this))}
				</tbody>
			</table>
		);
	},
});
var Hand = React.createClass({
	render: function(){
		return (
			<div className={"mochi mochi"+this.props.color}>
				<div className="tebanname">{colorToMark(this.props.color)}</div>
				<div className="mochimain">
					{["FU","KY","KE","GI","KI","KA","HI"].map(function(kind){
						return <PieceHand value={this.props.data[kind]} data={{kind: kind, color: this.props.color}} ImageDirectoryPath={this.props.ImageDirectoryPath} />;
					}.bind(this))}
				</div>
			</div>
		);
	},
});
var PieceHand = React.createClass({
	mixins: [DragDropMixin],
	statics: {
		configureDragDrop: function(registerType) {
			registerType("piecehand", {
				dragSource: {
					beginDrag: function(component) {
						return {item: {piece: component.props.data.kind}};
					}
				},
			});
		}
	},
	render: function(){
		var classNames = ["mochigoma", "mochi_"+this.props.kind, this.props.value<=1?"mai"+this.props.value:""].join(" ");
		return (
			<span className={classNames}>
				<img src={this.getPieceImage(this.props.data.kind, this.props.data.color)} {...this.dragSourceFor("piecehand")}/>
				<span className='maisuu'>{numToKanji(this.props.value)}</span>
			</span>
		);
	},
	getPieceImage: function(kind, color){
		return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
	},
});
var Piece = React.createClass({
	mixins: [DragDropMixin],
	statics: {
		configureDragDrop: function(registerType) {
			registerType("piece", {
				dragSource: {
					beginDrag: function(component) {
						return {item: {x: component.props.x, y: component.props.y}};
					}
				},
				dropTarget: {
					acceptDrop: function(component, item) {
						component.props.onInputMove({from: item, to: {x: component.props.x, y: component.props.y}});
					}
				},
			});
			registerType("piecehand", {
				dropTarget: {
					acceptDrop: function(component, item) {
						component.props.onInputMove({piece: item.piece, to: {x: component.props.x, y: component.props.y}});
					}
				},
			});
		}
	},
	render: function(){
		return (
			<td className={this.props.lastMove && this.props.lastMove.to.x==this.props.x && this.props.lastMove.to.y==this.props.y ? "lastto" : "" }>
				<img src={this.getPieceImage(this.props.data.kind, this.props.data.color)} {...this.dragSourceFor("piece")} {...this.dropTargetFor("piece","piecehand")} style={{visibility: this.getDragState("piece").isDragging?"hidden":""}} />
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
		return (
			<select className="forklist" value="top" onChange={function(){
				this.props.onChange(this.refs.select.getDOMNode().value)
			}.bind(this)} ref="select" disabled={forks.length==0}>
				{forks.length>0
					? [<option value="top">{this.props.nowMove}</option>].concat(forks.map(function(fork, i){
							return <option value={i}>{fork}</option>;
						}))
					: <option value="top">変化なし</option>}
			</select>
		);
	}
});
var Kifu = React.createClass({
	componentDidMount: function(){
		ajax(this.props.filename, function(data){
			try{
				this.setState({player: JKFPlayer.parse(data, this.props.filename)});
			}catch(e){
				alert("棋譜ファイルが壊れています: "+e);
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
		}.bind(this));
	},
	getInitialState: function(){
		return {player: new JKFPlayer({header: {}, moves: [{}]})};
	},
	onClickDl: function(){
		if(this.props.filename) window.open(this.props.filename);
	},
	onClickCredit: function(){
		if(confirm("*** CREDIT ***\nKifu for JS (ver. "+version+")\n    by na2hiro\n    under the MIT License\n\n公式サイトを開きますか？")){
			window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
		}
	},
	onChangeKifuList: function(n){
		this.goto(n);
	},
	onChangeForkList: function(n){
		this.forkAndForward(n);
	},
	onInputMove: function(move){
		try{
			if(!this.state.player.inputMove(move)){
				move.promote = confirm("成りますか？");
				this.state.player.inputMove(move);
			}
		}catch(e){
			alert("動かせません ("+e+")");
		}
		this.setState(this.state);
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

		return (
			<table className="kifuforjs" {...this.dropTargetFor(ReactDND.NativeDragItemTypes.FILE)} style={{backgroundColor: this.getDropState(ReactDND.NativeDragItemTypes.FILE).isHovering ? "silver" : ""}}>
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
											<select className="autoload" onChange={function(e){
												if(this.timerAutoload){
													clearInterval(this.timerAutoload);
												}
												var s = parseInt(e.target.value);
												if(!isNaN(s) && s>0){
													this.timerAutoload = setInterval(function(){
														this.reload();
													}.bind(this), s*1000);
												}
											}.bind(this)}>
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
							<Board board={this.state.player.getBoardState()} lastMove={this.state.player.getMove()} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.onInputMove} />
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
	},

	mixins: [DragDropMixin],

	statics: {
		configureDragDrop: function (registerType) {
			registerType(ReactDND.NativeDragItemTypes.FILE, {
				dropTarget: {
					acceptDrop: function(component, item) {
						// Do something with files
						if(item.files[0]){
							loadFile(item.files[0], function(data, name){
								component.setState({player: JKFPlayer.parse(data, name)});
							});
						}
					}
				}
			});
		}
	},
});

// ファイルオブジェクトと読み込み完了後のコールバック関数を渡す
// 読み込み完了後，callback(ファイル内容, ファイル名)を呼ぶ
function loadFile(file, callback){
	var reader = new FileReader();
	var encoding = getEncodingFromFileName(file.name);
	reader.onload = function(){
		callback(reader.result, file.name);
	};
	reader.readAsText(file, encoding);
}

function getEncodingFromFileName(filename){
	var tmp = filename.split("."), ext = tmp[tmp.length-1];
	return ["jkf", "kifu", "ki2u"].indexOf(ext)>=0 ? "UTF-8" : "Shift_JIS";
}

function load(filename, id){
	if(!id){
		id = "kifuforjs_"+Math.random().toString(36).slice(2);
		document.write("<div id='"+id+"'></div>");
	}
	$(document).ready(function(){
		React.render(
			<Kifu filename={filename} ImageDirectoryPath={Kifu.settings.ImageDirectoryPath}/>,
			document.getElementById(id)
		);
	});
};
function ajax(filename, onSuccess){
	var encoding = getEncodingFromFileName(filename);
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
Kifu.load=load;
Kifu.settings = {};
return Kifu;
})();
