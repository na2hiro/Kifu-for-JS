import {combineReducers} from "redux";

import JKFPlayer from "json-kifu-format";
import Actions from "./Actions.js"

function flipReducer(flip = false, action){
	switch(action.type) {
		case Actions.FLIP:
			return !flip;
	}
	return flip;
}

function playerReducer(state = {
	player: new JKFPlayer({header: {}, moves: [{}]}),
	filename: null
}, action){
	switch(action.type){
		case Actions.GOTO:
			if(isNaN(action.ply)) break;
			state.player.goto(action.ply);
			break;
		case Actions.GO:
			if(isNaN(action.ply)) break;
			state.player.go(Number(action.ply));
			break;
		case Actions.INPUT_MOVE:
			try{
				if(!state.player.inputMove(action.move)){
					action.move.promote = confirm("成りますか？");
					state.player.inputMove(action.move);
				}
			} catch(e) {
				// ignore
			}
			break;
		case Actions.FORK_AND_FORWARD:
			state.player.forkAndForward(action.n);
			break;
		case Actions.SET_PLAYER:
			const sameFile = state.filename == action.filename;
			if(sameFile){
				const ply = state.player.tesuu == state.player.getMaxTesuu() ? Infinity : state.player.tesuu;
				action.player.goto(ply);
			}
			return {player: action.player, filename: action.filename};
		case Actions.LOG_ERROR:
			const move = state.player.kifu.moves[0];
			if(move.comments){
				move.comments = action.message.split("\n").concat(move.comments);
			}else{
				move.comments = action.message.split("\n");
			}
			break;
		default:
			return state;
	}
	return {player: state.player, filename: state.filename}; // 新しい{}でpureということにしておく．TODO: immutable
}

export default combineReducers({
	flip: flipReducer,
	player: playerReducer
});
