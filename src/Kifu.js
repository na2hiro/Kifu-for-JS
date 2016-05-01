import React from "react";
import JKFPlayer from "json-kifu-format";
import {DragDropContext, DropTarget, DragSource} from "react-dnd";
import HTML5Backend, {NativeTypes} from "react-dnd-html5-backend";
import {connect} from "react-redux"

import Board from "./Board.js";
import ForkList from "./components/ForkList.js";
import KifuList from "./components/KifuList.js";
import Hand from "./components/Hand.js";
import Actions from "./Actions.js"
import {version, loadFile} from "./util.js"

@connect(state => ({
    flip: state.flip,
    player: state.player
}))
@DragDropContext(HTML5Backend)
@DropTarget(NativeTypes.FILE, {
    drop(props, monitor, component){
        if(monitor.getItem().files[0]){
            loadFile(monitor.getItem().files[0], (data, name) => {
                try{
                    props.dispatch(Actions.setPlayer(JKFPlayer.parse(data, name)));
                }catch(e){
                    component.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+data);
                }
            });
        }
    },
}, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
})
export default class Kifu extends React.Component {
    constructor(props){
        super(props);
        this.state = {};

        this.onClickDl = this.onClickDl.bind(this);
        this.clickDlAvailable = this.clickDlAvailable.bind(this);
        this.onClickReverse = this.onClickReverse.bind(this);
        this.onClickCredit = this.onClickCredit.bind(this);
        this.onChangeKifuList = this.onChangeKifuList.bind(this);
        this.onChangeForkList = this.onChangeForkList.bind(this);
        this.onInputMove = this.onInputMove.bind(this);
    }
    componentDidMount(){
        if(this.props.callback) {
            this.props.callback((data, filename) => {
                try {
                    this.props.dispatch(Actions.setPlayer(JKFPlayer.parse(data, filename), filename));
                }catch(e){
                    this.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+data);
                }
            });
        } else {
            try{
                this.props.dispatch(Actions.setPlayer(JKFPlayer.parse(this.props.kifu)))
            }catch(e){
                this.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+this.props.kifu);
            }
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.kifu!=nextProps.kifu){
            try{
                JKFPlayer.log("reload");
                this.props.dispatch(Actions.setPlayer(JKFPlayer.parse(nextProps.kifu)));
            }catch(e){
                this.logError("棋譜形式エラー: この棋譜ファイルを @na2hiro までお寄せいただければ対応します．\n=== 棋譜 ===\n"+this.props.kifu);
            }
        }
    }
    logError(message){
        this.props.dispatch(Actions.logError(message));
    }
    reload(){
        if(this.props.callback){
            this.props.callback((data, filename) => {
                JKFPlayer.log("reload");
                this.props.dispatch(Actions.setPlayer(JKFPlayer.parse(data, filename), filename));
            });
        }
    }
    onClickDl(){
        if(this.clickDlAvailable()) window.open(this.props.player.filename);
    }
    clickDlAvailable(){
        return this.props.player.filename;
    }
    onClickReverse(){
        this.props.dispatch(Actions.flip());
    }
    onClickCredit(){
        if(confirm("*** CREDIT ***\nKifu for JS (ver. "+version+")\n    by na2hiro\n    under the MIT License\n\n公式サイトを開きますか？")){
            window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
        }
    }
    onChangeKifuList(n){
        this.goto(n);
    }
    onChangeForkList(n){
        this.forkAndForward(n);
    }
    onInputMove(move){
        this.props.dispatch(Actions.inputMove(move));
    }
    forkAndForward(num){
        this.props.dispatch(Actions.forkAndForward(num));
    }
    goto(ply){
        this.props.dispatch(Actions.goto(ply));
    }
    go(ply){
        this.props.dispatch(Actions.go(ply));
    }
    render(){
        const player = this.props.player.player;
        const data = player.kifu.header;
        const dds = [];
        for(let key in data){
            dds.push(<dt key={"key"+key}>{key}</dt>);
            dds.push(<dd key={"val"+key}>{data[key]}</dd>);
        }
        const info = <dl>{dds}</dl>;

        const state = player.getState();

        const header = player.kifu.header;
        const players = [
            header["先手"] || header["下手"],
            header["後手"] || header["上手"]
        ];

        const reversed = this.props.flip;
        const withFork = player.kifu.moves.some((move) => move.forks && move.forks.length>0);

        return this.props.connectDropTarget(
            <table className="kifuforjs" style={{backgroundColor: this.props.isOver ? "silver" : ""}}>
                <tbody>
                <tr>
                    <td>
                        <div className={"inlineblock players "+(withFork?"withfork":"")}>
                            <Hand color={reversed?0:1} data={state.hands[reversed?0:1]} playerName={players[reversed?0:1]}
                                  ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.onInputMove} reversed={reversed}/>
                            <div className="mochi">
                                <KifuList onChange={this.onChangeKifuList} kifu={player.getReadableKifuState()}
                                          tesuu={player.tesuu} />
                                <ul className="lines">
                                    <li className="fork">
                                        <ForkList onChange={this.onChangeForkList} forks={player.getReadableForkKifu()}
                                                  nowMove={player.tesuu<player.getMaxTesuu()
                                                      ? player.getReadableKifu(player.tesuu+1)
                                                      : null} />
                                    </li>
                                    <li><button className="dl" onClick={this.onClickDl}
                                                disabled={!this.clickDlAvailable()}>棋譜保存</button></li>

                                    <li>
                                        <select className="autoload" onChange={(e) => {
												if(this.timerAutoload){
													clearInterval(this.timerAutoload);
												}
												const s = parseInt(e.target.value);
												if(!isNaN(s)){
													this.timerAutoload = setInterval(()=>{
														this.reload();
													}, s*1000);
												}
											}}>
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
                        <Board board={state.board} lastMove={player.getMove()} onInputMove={this.onInputMove}
                               reversed={reversed} ImageDirectoryPath={this.props.ImageDirectoryPath} />
                    </td>
                    <td>
                        <div className="inlineblock players">
                            <div className="mochi info">
                                {info}
                            </div>
                            <Hand color={reversed?1:0} data={state.hands[reversed?1:0]} playerName={players[reversed?1:0]}
                                  ImageDirectoryPath={this.props.ImageDirectoryPath} onInputMove={this.onInputMove} reversed={reversed}/>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan="3" style={{textAlign:"center"}}>
                        <ul className="inline go" style={{margin:"0 auto"}} onClick={(e)=>{
										if(e.target.tagName!="BUTTON") return;
										this.go($(e.target).data("go"));
									}}>
                            <li><button data-go="-Infinity">|&lt;</button></li>
                            <li><button data-go="-10">&lt;&lt;</button></li>
                            <li><button data-go="-1">&lt;</button></li>
                            <li>
                                <input type="text" name="tesuu" size="3" ref="tesuu" value={player.tesuu} onChange={(e)=>{
											this.goto(e.target.value);
										}} />
                            </li>
                            <li><button data-go="1">&gt;</button></li>
                            <li><button data-go="10">&gt;&gt;</button></li>
                            <li><button data-go="Infinity">&gt;|</button></li>
                        </ul>
                        <ul className="inline tools">
                            <li><button onClick={this.onClickReverse}>反転</button></li>
                            <li><button onClick={this.onClickCredit}>credit</button></li>
                        </ul>
                        <textarea rows="10" className="comment" disabled value={player.getComments().join("\n")}></textarea>
                    </td>
                </tr>
                </tbody>
            </table>
        );
    }
}

