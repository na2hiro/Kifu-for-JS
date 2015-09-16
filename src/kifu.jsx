/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import React from "react";
import JKFPlayer from "json-kifu-format";
import {Color} from "json-kifu-format/node_modules/shogi.js";
import {DragDropContext, DropTarget, DragSource} from "react-dnd";
import HTML5Backend, {NativeTypes} from "react-dnd/modules/backends/HTML5";

var version = "1.1.0";
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
				<div className="tebanname">{colorToMark(this.props.color)+(this.props.playerName||"")}</div>
				<div className="mochimain">
					{["FU","KY","KE","GI","KI","KA","HI"].map(function(kind){
						return <PieceHand value={this.props.data[kind]} data={{kind: kind, color: this.props.color}} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.props.onInputMove} />;
					}.bind(this))}
				</div>
			</div>
		);
	},
});
var PieceHand = DragSource("piecehand", {
	beginDrag: function(props, monitor, component) {
		return {piece: props.data.kind};
	},
	endDrag: function(props, monitor, component){
		props.onInputMove({piece: monitor.getItem().piece, to: monitor.getDropResult()});
	}
}, function collect(connect, monitor){
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
})(React.createClass({
	render: function(){
		var classNames = ["mochigoma", "mochi_"+this.props.kind, this.props.value<=1?"mai"+this.props.value:""].join(" ");
		return (
			<span className={classNames}>
				{this.props.connectDragSource(<img src={this.getPieceImage(this.props.data.kind, this.props.data.color)}/>)}
				<span className='maisuu'>{numToKanji(this.props.value)}</span>
			</span>
		);
	},
	getPieceImage: function(kind, color){
		return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
	},
}));
var Piece = DragSource("piece", {
	beginDrag: function(props, monitor, component) {
		return {x: props.x, y: props.y};
	},
	endDrag: function(props, monitor, component){
		props.onInputMove({from: monitor.getItem(), to: monitor.getDropResult()});
	}
}, function collect(connect, monitor){
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
})(DropTarget(["piece", "piecehand"], {
	drop: function(props, monitor, component) {
		return {x: props.x, y: props.y};
	},
}, function collect(connect, monitor){
	return {
		connectDropTarget: connect.dropTarget()
	};
})(React.createClass({
	render: function(){
		return (
			<td className={this.props.lastMove && this.props.lastMove.to.x==this.props.x && this.props.lastMove.to.y==this.props.y ? "lastto" : "" }>
				{this.props.connectDropTarget(this.props.connectDragSource(
					<img src={this.getPieceImage(this.props.data.kind, this.props.data.color)} style={{visibility: this.props.isDragging?"hidden":""}} />
				))}
			</td>
		);
	},
	getPieceImage: function(kind, color){
		return this.props.ImageDirectoryPath+"/"+(!kind?"blank":color+kind)+".png";
	},
})));
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
var Kifu = DragDropContext(HTML5Backend)(DropTarget(NativeTypes.FILE, {
	drop: function(props, monitor, component){
		if(monitor.getItem().files[0]){
			loadFile(monitor.getItem().files[0], function(data, name){
				try{
					component.setState({player: JKFPlayer.parse(data, name)});
				}catch(e){
					component.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+data);
				}
			});
		}
	},
}, function collect(connect, monitor){
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
})(React.createClass({
	componentDidMount: function(){
		if(this.props.filename){
			ajax(this.props.filename, function(data, err){
				if(err){
					this.logError(err);
					return;
				}
				try{
					this.setState({player: JKFPlayer.parse(data, this.props.filename)});
				}catch(e){
					this.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+data);
				}
			}.bind(this));
		}else{
				try{
					this.setState({player: JKFPlayer.parse(this.props.kifu)});
				}catch(e){
					this.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+this.props.kifu);
				}
		}
	},
	logError: function(errs){
		var move = this.state.player.kifu.moves[0];
		if(move.comments){
			move.comments = errs.split("\n").concat(move.comments);
		}else{
			move.comments = errs.split("\n");
		}
		this.setState(this.state);
	},
	reload: function(){
		ajax(this.props.filename, function(data, err){
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
			// ignore
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
		tesuu = Number(tesuu);
		if(isNaN(tesuu)) return;
		this.state.player.go(tesuu);
		this.setState(this.state);
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

		return this.props.connectDropTarget(
			<table className="kifuforjs" style={{backgroundColor: this.props.isOver ? "silver" : ""}}>
				<tbody>
					<tr>
						<td>
							<div className={"inlineblock players "+(this.state.player.kifu.moves.some(function(move){return move.forks&&move.forks.length>0;})?"withfork":"")}>
								<Hand color={1} data={state.hands[1]} playerName={this.state.player.kifu.header["後手"] || this.state.player.kifu.header["上手"]} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.onInputMove}/>
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
												if(!isNaN(s)){
													this.timerAutoload = setInterval(function(){
														this.reload();
													}.bind(this), s*1000);
												}
											}.bind(this)}>
												<option value="NaN">自動更新しない</option>
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
							<Board board={state.board} lastMove={this.state.player.getMove()} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.onInputMove} />
						</td>
						<td>
							<div className="inlineblock players">
								<div className="mochi info">
									{info}
								</div>
								<Hand color={0} data={state.hands[0]} playerName={this.state.player.kifu.header["先手"] || this.state.player.kifu.header["下手"]} ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.onInputMove}/>
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
								<li><button data-go="-Infinity">|&lt;</button></li>
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
								<li><button data-go="Infinity">&gt;|</button></li>
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
})));


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
}

function loadString(kifu, id){
	if(!id){
		id = "kifuforjs_"+Math.random().toString(36).slice(2);
		document.write("<div id='"+id+"'></div>");
	}
	$(document).ready(function(){
		React.render(
			<Kifu kifu={kifu} ImageDirectoryPath={Kifu.settings.ImageDirectoryPath}/>,
			document.getElementById(id)
		);
	});
}

function ajax(filename, onSuccess){
	var encoding = getEncodingFromFileName(filename);
	$.ajax(filename, {
		success: function(data, textStatus){
			if(textStatus=="notmodified"){
				return;
			}
			onSuccess(data);
		},
		error: function(jqXHR, textStatus, errorThrown){
			if(textStatus!="notmodified"){
				var message = "棋譜の取得に失敗しました: "+filename;
				if(document.location.protocol=="file:"){
					message+="\n\n【備考】\nAjaxのセキュリティ制約により，ローカルの棋譜の読み込みが制限されている可能性があります．\nサーバ上にアップロードして動作をご確認下さい．\nもしくは，棋譜ファイルのドラッグ&ドロップによる読み込み機能をお試し下さい．";
				}
				onSuccess(null, message);
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
Kifu.loadString=loadString;
Kifu.settings = {};
export default Kifu;
