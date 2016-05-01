const FLIP = "FLIP";
const GO = "GO";
const GOTO = "GOTO";
const FORK_AND_FORWARD = "FORK_AND_FORWARD";
const INPUT_MOVE = "INPUT_MOVE";
const SET_PLAYER = "SET_PLAYER";
const LOG_ERROR = "LOG_ERROR";
export default { // add-module-exports bug?
	FLIP,
	flip(){
		return {
			type: FLIP
		};
	},
	GO,
	go(ply){
		return {
			type: GO,
			ply
		};
	},
	GOTO,
	goto(ply){
		return {
			type: GOTO,
			ply
		};
	},
	FORK_AND_FORWARD,
	forkAndForward(n){
		return {
			type: FORK_AND_FORWARD,
			n
		};
	},
	INPUT_MOVE,
	inputMove(move){
		return {
			type: INPUT_MOVE,
			move
		}
	},
	SET_PLAYER,
	setPlayer(player, filename){
		return {
			type: SET_PLAYER,
			player,
			filename
		};
	},
	LOG_ERROR,
	logError(message){
		return {
			type: LOG_ERROR,
			message
		};
	}
};
