var assert = require('assert');
var JKFPlayer = require('../lib/jkfplayer.js');

function p(x, y){
	return {x:x,y:y};
}
describe("class Player", function(){
	it("new", function(){
		var player = new JKFPlayer({
			header: {},
			moves: [{}]
		});
	});
	describe("parse", function(){
		it("kif", function(){
			JKFPlayer.parse("1 ７六歩\n");
			JKFPlayer.parse("1 ７六歩\n","hoge.kif");
		});
		it("ki2", function(){
			JKFPlayer.parse("▲７六歩");
			JKFPlayer.parse("▲７六歩","./hoge.ki2");
		});
		it("csa", function(){
			JKFPlayer.parse("PI\n+\n");
			JKFPlayer.parse("PI\n+\n","http://shogitter.com/kifu/hoge.csa");
		});
		it("jkf", function(){
			JKFPlayer.parse('{"header":{},"moves":[]}');
			JKFPlayer.parse('{"header":{},"moves":[]}',"hoge.jkf");
		});
		it("illegal", function(){
			assert.throws(function(){
				JKFPlayer.parse("ふが");
			});
		});
	});
	describe("forward", function(){
		it("normal", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),color:0,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:1,piece:"FU"}},
					{move:{from:p(8,9),to:p(7,7),color:0,piece:"KE"}},
					{move:{from:p(2,2),to:p(7,7),color:1,piece:"KA",capture:"KE",promote:true,same:true}},
					{move:{from:p(8,8),to:p(7,7),color:0,piece:"KA",capture:"UM",same:true}},
					{move:{to:p(3,3),color:1,piece:"KE",relative:"H"}}
				]
			});
			assert.equal(player.shogi.toCSAString(), "\
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n\
P2 * -HI *  *  *  *  * -KA * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P4 *  *  *  *  *  *  *  *  * \n\
P5 *  *  *  *  *  *  *  *  * \n\
P6 *  *  *  *  *  *  *  *  * \n\
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU\n\
P8 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
P+\n\
P-\n\
+");
			assert(player.forward());
			assert.equal(player.shogi.toCSAString(), "\
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n\
P2 * -HI *  *  *  *  * -KA * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P4 *  *  *  *  *  *  *  *  * \n\
P5 *  *  *  *  *  *  *  *  * \n\
P6 *  * +FU *  *  *  *  *  * \n\
P7+FU+FU * +FU+FU+FU+FU+FU+FU\n\
P8 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
P+\n\
P-\n\
-");
			assert(player.forward());
			assert(player.forward());
			assert(player.forward());
			assert(player.forward());
			assert(player.forward());
			var sixth = "\
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n\
P2 * -HI *  *  *  *  *  *  * \n\
P3-FU-FU-FU-FU-FU-FU-KE-FU-FU\n\
P4 *  *  *  *  *  * -FU *  * \n\
P5 *  *  *  *  *  *  *  *  * \n\
P6 *  * +FU *  *  *  *  *  * \n\
P7+FU+FU+KA+FU+FU+FU+FU+FU+FU\n\
P8 *  *  *  *  *  *  * +HI * \n\
P9+KY * +GI+KI+OU+KI+GI+KE+KY\n\
P+00KA\n\
P-\n\
+";
			assert.equal(player.shogi.toCSAString(), sixth);
			assert.equal(player.forward(), false);
			assert.equal(player.shogi.toCSAString(), sixth);
		});
		it("with special", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),color:0,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:1,piece:"FU"}},
					{special: "CHUDAN"}
				]
			});
			assert(player.forward());
			assert(player.forward());
			var second = player.shogi.toCSAString();
			assert(player.forward());
			assert.equal(player.shogi.toCSAString(), second);
			assert.equal(player.forward(), false);
			assert.equal(player.shogi.toCSAString(), second);
		});
	});
	describe("backward", function(){
		it("normal", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),color:0,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:1,piece:"FU"}},
					{special: "CHUDAN"}
				]
			});
			var first = player.shogi.toCSAString();
			player.forward();
			assert(player.backward());
			assert.equal(player.shogi.toCSAString(), first);
			assert.equal(player.backward(), false);
		});
	});
	it("goto, go", function(){
		var player = new JKFPlayer({
			header: {},
			moves: [
				{},
				{move:{from:p(7,7),to:p(7,6),color:0,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:1,piece:"FU"}},
				{special: "CHUDAN"}
			]
		});
		var initial = player.shogi.toCSAString();
		assert.equal(player.tesuu, 0);
		assert(player.forward());
		assert.equal(player.tesuu, 1);
		assert(player.forward());
		assert.equal(player.tesuu, 2);
		var second = player.shogi.toCSAString();
		assert(player.forward());
		assert.equal(player.tesuu, 3);
		assert.equal(player.forward(), false);
		assert.equal(player.tesuu, 3);
		player.goto(0);
		assert.equal(player.tesuu, 0);
		assert.equal(player.shogi.toCSAString(), initial);
		assert.equal(player.backward(), false);
		assert.equal(player.tesuu, 0);
		player.go(2);
		assert.equal(player.tesuu, 2);
		assert.equal(player.shogi.toCSAString(), second);
	});
	it("goto Infinity", function(){
		var player = new JKFPlayer({
			header: {},
			moves: [
				{},
				{move:{from:p(7,7),to:p(7,6),color:0,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:1,piece:"FU"}},
				{special: "CHUDAN"}
			]
		});
		var first = player.shogi.toCSAString();
		assert.equal(player.tesuu, 0);
		player.goto(Infinity); // goto last
		assert.equal(player.tesuu, 3);
		player.goto(-1);
		assert.equal(player.tesuu, 0);
		assert.equal(player.shogi.toCSAString(), first);
	});
	describe("forkAndForward", function(){
		it("new", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),color:0,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:1,piece:"FU"}},
					{move:{from:p(8,9),to:p(7,7),color:0,piece:"KE"}, forks:[
						[
							{move:{from:p(8,8),to:p(2,2),color:0,piece:"KA",capture:"KA",promote:false}},
							{move:{from:p(3,1),to:p(2,2),color:1,piece:"GI",capture:"KA",same:true}},
							{move:{to:p(4,5),color:0,piece:"KA"}}
						]
					]},
					{move:{from:p(2,2),to:p(7,7),color:1,piece:"KA",capture:"KE",promote:true,same:true}},
					{move:{from:p(8,8),to:p(7,7),color:0,piece:"KA",capture:"UM",same:true}},
					{move:{to:p(3,3),color:1,piece:"KE",relative:"H"}}
				]
			});
			assert(player.forward());
			assert(player.forward());
			var beforeFork = player.shogi.toCSAString();
			assert.equal(player.forkAndForward(1), false);
			assert.equal(player.shogi.toCSAString(), beforeFork);
			assert(player.forkAndForward(0));
			assert(player.forward());
			assert(player.forward());
			assert.equal(player.forward(), false);
			assert(player.backward());
			assert(player.backward());
			assert(player.backward());
			assert.equal(player.shogi.toCSAString(), beforeFork);
		});
	});
	describe("inputMove", function(){
		it("new input", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
				]
			});
			var first = player.shogi.toCSAString();
			assert(player.inputMove({from:p(7,7),to:p(7,6)}));
			assert(player.inputMove({from:p(3,3),to:p(3,4)}));
			assert(player.backward());
			assert(player.backward());
			assert.equal(player.shogi.toCSAString(), first);
		});
		it("same with existing one", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
				]
			});
			assert(player.inputMove({from:p(7,7),to:p(7,6)}));
			assert(player.inputMove({from:p(3,3),to:p(3,4)}));
			assert(player.inputMove({from:p(2,7),to:p(2,6)}));
			var leaf = player.shogi.toCSAString();
			player.goto(1);
			assert(player.inputMove({from:p(3,3),to:p(3,4)}));
			assert(player.forward());
			assert.equal(player.shogi.toCSAString(), leaf);
			player.goto(1);
			assert.equal(player.forkAndForward(0), false);
		});
		it("same with existing fork", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
				]
			});
			assert(player.inputMove({from:p(7,7),to:p(7,6)}));
			assert(player.inputMove({from:p(3,3),to:p(3,4)}));
			assert(player.backward());
			assert(player.inputMove({from:p(1,3),to:p(1,4)}));
			assert(player.backward());
			assert(player.inputMove({from:p(8,3),to:p(8,4)}));
			assert(player.inputMove({from:p(2,7),to:p(2,6)}));
			var leaf = player.shogi.toCSAString();
			player.goto(1);
			assert(player.inputMove({from:p(8,3),to:p(8,4)}));
			assert(player.forward());
			assert.equal(player.shogi.toCSAString(), leaf);
			player.goto(1);
			assert.equal(player.forkAndForward(2), false);
		});
		it("can't add fork to special", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{special: "CHUDAN"}
				]
			});
			assert.throws(function(){
				player.forward();
				player.inputMove({from:p(7,7),to:p(7,6)});
			});
		});
		it("possibility of promotion", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),piece:"FU",color:0}},
					{move:{from:p(3,3),to:p(3,4),piece:"FU",color:1}},
				]
			});
			player.goto(2);
			assert.equal(player.inputMove({from:p(8,8),to:p(2,2)}),false);
			assert(player.inputMove({from:p(8,8),to:p(2,2),promote:true}));
			player.backward();
			assert(player.inputMove({from:p(8,8),to:p(2,2),promote:false}));
		});
	});
	it("numToZen", function(){
		assert.equal(JKFPlayer.numToZen(7), "７");
		assert.equal(JKFPlayer.numToZen(9), "９");
	});
	it("numToKan", function(){
		assert.equal(JKFPlayer.numToKan(7), "七");
		assert.equal(JKFPlayer.numToKan(9), "九");
	});
	it("moveToReadableKifu", function(){
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(7,7), to:p(7,6), piece:"FU", color:0}
		}), "☗７六歩");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(2,3), to:p(2,4), piece:"FU", color:1, same:true}
		}), "☖同　歩");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(3,3), to:p(2,4), piece:"GI", color:0, promote:true}
		}), "☗２四銀成");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(3,3), to:p(2,4), piece:"GI", color:0, promote:false}
		}), "☗２四銀不成");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(6,8), to:p(5,7), piece:"GI", color:0, relative:"RU"}
		}), "☗５七銀右上");
		assert.equal(JKFPlayer.moveToReadableKifu({
			special: "TORYO"
		}), "投了");
	});
	describe("wrappers", function(){
		var player;
		beforeEach(function(){
			player = new JKFPlayer({
				header: {},
				moves: [
					{comments:["hoge"]},
					{move:{from:p(7,7),to:p(7,6),piece:"FU",color:0},forks:[
						[{move:{from:p(2,7),to:p(2,6),piece:"FU",color:0}}]
					]},
					{move:{from:p(3,3),to:p(3,4),piece:"FU",color:1}},
				]
			});
		});
		it("getBoard", function(){
			assert.deepEqual(player.getBoard(7, 7), {color:0,kind:"FU"});
			assert.equal(player.getBoard(7, 6), null);
		});
		it("getComments", function(){
			assert.deepEqual(player.getComments(), ["hoge"]);
			assert.deepEqual(player.getComments(2), []);
		});
		it("getMove", function(){
			assert.deepEqual(player.getMove(), void 0);
			assert.deepEqual(player.getMove(2), {from:p(3,3),to:p(3,4),piece:"FU",color:1});
		});
		it("getReadableKifu", function(){
			assert.deepEqual(player.getReadableKifu(), "開始局面");
			assert.equal(player.getReadableKifu(2), "☖３四歩");
		});
		it("getState", function(){
			assert.deepEqual(player.getState(), {
				board: [
					[{ color: 1, kind: "KY" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KY" },],
					[{ color: 1, kind: "KE" }, { color: 1, kind: "KA" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "HI" }, { color: 0, kind: "KE" },],
					[{ color: 1, kind: "GI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "GI" },],
					[{ color: 1, kind: "KI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KI" },],
					[{ color: 1, kind: "OU" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "OU" },],
					[{ color: 1, kind: "KI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KI" },],
					[{ color: 1, kind: "GI" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "GI" },],
					[{ color: 1, kind: "KE" }, { color: 1, kind: "HI" }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, { color: 0, kind: "KA" }, { color: 0, kind: "KE" },],
					[{ color: 1, kind: "KY" }, {                      }, { color: 1, kind: "FU" }, {}, {}, {}, { color: 0, kind: "FU" }, {                      }, { color: 0, kind: "KY" },],
				],
				color: 0,
				hands:[
					{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
					{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
				]
			});
		});
		it("getReadableKifuState", function(){
			assert.deepEqual(player.getReadableKifuState(), [
				{kifu:"開始局面", forks:[], comments: ["hoge"]},
				{kifu:"☗７六歩", forks:["☗２六歩"], comments: []},
				{kifu:"☖３四歩", forks:[], comments: []},
			]);
		});
		it("getReadableForkKifu", function(){
			assert.deepEqual(player.getReadableForkKifu(1), []);
			assert.deepEqual(player.getReadableForkKifu(), ["☗２六歩"]);
		});
		it("getNextFork", function(){
			assert.deepEqual(player.getNextFork(1), []);
			assert.deepEqual(player.getNextFork(), [
				[{ "move": {"color": 0,"from":p(2,7),"piece": "FU","to":p(2,6)}}]
			]);
		});
		it("toJKF", function(){
			var jkf = JSON.parse(player.toJKF());
			var player2 = new JKFPlayer(jkf);
			assert.deepEqual(jkf, JSON.parse(player2.toJKF()));
		});
		it("getMoveFormat", function(){
			player.forkAndForward(0);
			assert.deepEqual(player.getMoveFormat(0), {comments:["hoge"]});
		});
	});
	it("static sameMoveMinimal", function(){
		assert(JKFPlayer.sameMoveMinimal({from:p(2,3),to:p(2,2),promote:true}, {from:p(2,3),to:p(2,2),promote:true, piece:"FU"}));
		assert(JKFPlayer.sameMoveMinimal({to:p(2,3),piece:"KY"}, {to:p(2,3),piece:"KY"}));
		assert.equal(JKFPlayer.sameMoveMinimal({from:p(2,3),to:p(2,2),promote:false}, {from:p(2,3),to:p(2,2),promote:true, piece:"FU"}), false);
		assert.equal(JKFPlayer.sameMoveMinimal({to:p(2,3),piece:"KE"}, {to:p(2,3),piece:"KY"}), false);
		assert.equal(JKFPlayer.sameMoveMinimal({from:p(2,7),to:p(2,6),piece:"FU"}, {to:p(2,6),piece:"KA"}), false);
	});
});
