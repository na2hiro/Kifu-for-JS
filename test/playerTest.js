var assert = require('assert');
var JKFPlayer = require('../lib/player.js');

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
		var player = JKFPlayer.parse("");
	});
	describe("forward", function(){
		it("normal", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
					{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}},
					{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
					{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
					{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
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
					{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
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
					{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
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
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{special: "CHUDAN"}
			]
		});
		var first = player.shogi.toCSAString();
		player.forward();
		player.forward();
		var third = player.shogi.toCSAString();
		player.goto(0);
		assert.equal(player.shogi.toCSAString(), first);
		player.go(2);
		assert.equal(player.shogi.toCSAString(), third);
	});
	describe("forkAndForward", function(){
		it("new", function(){
			var player = new JKFPlayer({
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
					{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
					{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}, forks:[
						[
							{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
							{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
							{move:{to:p(4,5),color:true,piece:"KA"}}
						]
					]},
					{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
					{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
					{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
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
					{move:{from:p(7,7),to:p(7,6),piece:"FU",color:true}},
					{move:{from:p(3,3),to:p(3,4),piece:"FU",color:false}},
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
			move: {from:p(7,7), to:p(7,6), piece:"FU", color:true}
		}), "☗７六歩");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(2,3), to:p(2,4), piece:"FU", color:false, same:true}
		}), "☖同　歩");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(3,3), to:p(2,4), piece:"GI", color:true, promote:true}
		}), "☗２四銀成");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(3,3), to:p(2,4), piece:"GI", color:true, promote:false}
		}), "☗２四銀不成");
		assert.equal(JKFPlayer.moveToReadableKifu({
			move: {from:p(6,8), to:p(5,7), piece:"GI", color:true, relative:"RU"}
		}), "☗５七銀右上");
		assert.equal(JKFPlayer.moveToReadableKifu({
			special: "TORYO"
		}), "投了");
	});
});
