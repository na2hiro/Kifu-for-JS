var assert = require('assert');
var ShogiJS = require('../lib/shogi.js');
var Shogi = ShogiJS.Shogi;
var Color = ShogiJS.Color;

function sortMove(moves){
	return moves.sort(function(a, b){
		return toNum(a)-toNum(b);
	});
	function toNum(move){
		return move.from
			? move.from.x*9*9*9 + move.from.y*9*9 + move.to.x*9 + move.to.y
			: -kindToNum(move.kind)*9*9*2 + move.color*9*9 + move.to.x*9 + move.to.y;
	}
	function kindToNum(kind){
		return ["FU","KY","KE","GI","KI","KA","HI","OU"];
	}
}

describe("class Shogi", function(){
	var shogi;
	beforeEach(function(){
		shogi = new Shogi();
	});
	describe("initialize", function(){
		it("normal", function(){
			shogi.initialize();
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
		});
		it("komaochi", function(){
			shogi.initialize({preset: "6"});
			assert.equal(shogi.toCSAString(), [
				"P1 *  * -GI-KI-OU-KI-GI *  * ",
				"P2 *  *  *  *  *  *  *  *  * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"-"].join("\n"));
		});
		it("other, multiple initialize", function(){
			shogi.initialize({
				preset: "OTHER",
				data: {
					board: [
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{color: Color.White, kind: "OU"}, {}, {color: Color.Black, kind: "FU"}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}]
					],
					color: Color.Black,
					hands: [
						{"KI":1},
						{}
					]
				}
			});
			assert.equal(shogi.toCSAString(), [
				"P1 *  *  *  *  *  *  * -OU * ",
				"P2 *  *  *  *  *  *  *  *  * ",
				"P3 *  *  *  *  *  *  * +FU * ",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7 *  *  *  *  *  *  *  *  * ",
				"P8 *  *  *  *  *  *  *  *  * ",
				"P9 *  *  *  *  *  *  *  *  * ",
				"P+00KI",
				"P-",
				"+"].join("\n"));
			shogi.initialize({
				preset: "OTHER",
				data: {
					board: [
						[{}, {}, {}, {}, {}, {color: Color.White, kind: "KE"}, {color: Color.White, kind: "KE"}, {}, {color: Color.Black, kind: "OU"}],
						[{}, {}, {}, {}, {}, {color: Color.White, kind: "KE"}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}],
						[{}, {}, {}, {}, {}, {}, {}, {}, {}]
					],
					color: Color.White,
					hands: [
						{},
						{"KE":1}
					]
				}
			});
			assert.equal(shogi.toCSAString(), [
				"P1 *  *  *  *  *  *  *  *  * ",
				"P2 *  *  *  *  *  *  *  *  * ",
				"P3 *  *  *  *  *  *  *  *  * ",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  * -KE-KE",
				"P7 *  *  *  *  *  *  *  * -KE",
				"P8 *  *  *  *  *  *  *  *  * ",
				"P9 *  *  *  *  *  *  *  * +OU",
				"P+",
				"P-00KE",
				"-"].join("\n"));
		});
	});
	describe("initializeFromSFENString", function(){
		it("example 1", function(){
			shogi.initializeFromSFENString("lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1");
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
		});
		it("example 2", function(){
		shogi.initializeFromSFENString("8l/1l+R2P3/p2pBG1pp/kps1p4/Nn1P2G2/P1P1P2PP/1PS6/1KSG3+r1/LN2+p3L w Sbgn3p 124");
			assert.equal(shogi.toCSAString(), [
				"P1 *  *  *  *  *  *  *  * -KY",
				"P2 * -KY+RY *  * +FU *  *  * ",
				"P3-FU *  * -FU+KA+KI * -FU-FU",
				"P4-OU-FU-GI * -FU *  *  *  * ",
				"P5+KE-KE * +FU *  * +KI *  * ",
				"P6+FU * +FU * +FU *  * +FU+FU",
				"P7 * +FU+GI *  *  *  *  *  * ",
				"P8 * +OU+GI+KI *  *  * -RY * ",
				"P9+KY+KE *  * -TO *  *  * +KY",
				"P+00GI",
				"P-00KA00KI00KE00FU00FU00FU",
				"-"].join("\n"));
		});
	})
	describe("editMode", function(){
		it("example 1", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(8, 2, 2, 2);
			var csa = shogi.toCSAString();

			shogi.initialize();
			shogi.editMode(true);
			shogi.captureByColor(8, 8, 0);
			shogi.captureByColor(2, 2, 1);
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 2, 2, 2);
			shogi.setTurn(0);
			shogi.editMode(false);

			assert.equal(shogi.toCSAString(), csa);
		});
		it("example 2", function() {
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			var csa = shogi.toCSAString();

			shogi.initialize();
			shogi.editMode(true);
			shogi.captureByColor(8, 8, 0);
			shogi.flip(2, 2);
			shogi.flip(2, 2);
			shogi.flip(2, 2);
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.setTurn(1);
			shogi.editMode(false);

			assert.equal(shogi.toCSAString(), csa);
		});
	});
	describe("move", function(){
		it("normal, promote", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * +UM * ",
				"P3-FU-FU-FU-FU-FU-FU * -FU-FU",
				"P4 *  *  *  *  *  * -FU *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  * +FU *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 *  *  *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+00KA",
				"P-",
				"-"].join("\n"));
		});
		it("errors", function(){
			var csaString = shogi.toCSAString();
			assert.throws(function(){
				shogi.move(7, 6, 7, 5);
			});
			assert.equal(shogi.toCSAString(), csaString);
			assert.throws(function(){
				shogi.move(7, 7, 7, 8);
			});
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("editMode", function(){
			shogi.editMode(true);
			shogi.move(7, 7, 7, 8);
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 * +KA+FU *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
		});
	});
	describe("unmove", function(){
		it("normal", function(){
			var csaString = shogi.toCSAString();
			shogi.move(7, 7, 7, 6);
			shogi.unmove(7, 7, 7, 6);
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("promote", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			var csaString = shogi.toCSAString();
			shogi.move(8, 8, 3, 3, true);
			shogi.unmove(8, 8, 3, 3, true);
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("capture", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			var csaString = shogi.toCSAString();
			shogi.move(8, 8, 2, 2, true);
			shogi.unmove(8, 8, 2, 2, true, "KA");
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("capture promoted", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			var csaString = shogi.toCSAString();
			shogi.move(3, 1, 2, 2);
			shogi.unmove(3, 1, 2, 2, false, "UM");
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("error", function(){
			assert.throws(function(){
				shogi.unmove(7, 7, 7, 6);
			});
		});
		it("promoteが間違ってtrueになっていても許容する", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			var csaString = shogi.toCSAString();
			shogi.move(3, 1, 2, 2);
			shogi.unmove(3, 1, 2, 2, true, "UM");
			assert.equal(shogi.toCSAString(), csaString);
		});
		describe("private prevTurn", function(){
			it("editMode", function(){
				shogi.editMode(true);
				var csaString = shogi.toCSAString();
				shogi.move(7, 7, 7, 6);
				shogi.unmove(7, 7, 7, 6);
				assert.equal(shogi.toCSAString(), csaString);
			});
		});
	});
	describe("drop", function(){
		it("normal", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			shogi.drop(4, 5, "KA");
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI * -KE-KY",
				"P2 * -HI *  *  *  *  * -GI * ",
				"P3-FU-FU-FU-FU-FU-FU * -FU-FU",
				"P4 *  *  *  *  *  * -FU *  * ",
				"P5 *  *  *  *  * +KA *  *  * ",
				"P6 *  * +FU *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 *  *  *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-00KA",
				"-"].join("\n"));
		});
		it("errors", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			var csaString = shogi.toCSAString();
			assert.throws(function(){
				shogi.drop(4, 5, "KA", Color.White);
			});
			assert.equal(shogi.toCSAString(), csaString);
			assert.throws(function(){
				shogi.drop(3, 4, "KA");
			});
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("editMode", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			shogi.editMode(true);
			shogi.drop(4, 5, "KA");
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI * -KE-KY",
				"P2 * -HI *  *  *  *  * -GI * ",
				"P3-FU-FU-FU-FU-FU-FU * -FU-FU",
				"P4 *  *  *  *  *  * -FU *  * ",
				"P5 *  *  *  *  * +KA *  *  * ",
				"P6 *  * +FU *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 *  *  *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-00KA",
				"+"].join("\n"));
			shogi.drop(5, 5, "KA", Color.White);
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI * -KE-KY",
				"P2 * -HI *  *  *  *  * -GI * ",
				"P3-FU-FU-FU-FU-FU-FU * -FU-FU",
				"P4 *  *  *  *  *  * -FU *  * ",
				"P5 *  *  *  * -KA+KA *  *  * ",
				"P6 *  * +FU *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 *  *  *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
		});
		describe("private popFromHand", function(){
			it("error", function(){
				assert.throws(function(){
					shogi.drop(5, 5, "FU");
				});
			});
			it("multiple hand", function(){
				shogi.move(7, 7, 7, 6);
				shogi.move(4, 3, 4, 4);
				shogi.move(8, 8, 4, 4);
				shogi.move(8, 2, 4, 2);
				shogi.move(4, 4, 5, 3, true);
				shogi.move(3, 3, 3, 4);
				shogi.move(5, 3, 4, 2);
				shogi.move(3, 1, 4, 2);
				shogi.drop(9, 8, "HI");
			});
		});
	});
	describe("undrop", function() {
		it("normal", function () {
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			var csaString = shogi.toCSAString();
			shogi.drop(4, 5, "KA");
			shogi.undrop(4, 5);
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("errors", function () {
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			shogi.drop(4, 5, "KA");
			var csaString = shogi.toCSAString();
			assert.throws(function () {
				shogi.undrop(5, 5);
			});
			assert.equal(shogi.toCSAString(), csaString);
			assert.throws(function () {
				shogi.undrop(3, 4);
			});
			assert.equal(shogi.toCSAString(), csaString);
		});
	});
	describe("toCSAString", function(){

	});
	describe("toSFENString", function(){
		it("normal", function(){
			assert.equal(shogi.toSFENString(),
				"lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1");
		});
		it("color", function(){
			shogi.initialize({preset:"KY"});
			assert.equal(shogi.toSFENString(),
				"lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
		});
		it("hands", function(){
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			assert.equal(shogi.toSFENString(5),
				"lnsgkg1nl/1r5s1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/7R1/LNSGKGSNL b Bb 5");
			shogi.move(7, 6, 7, 5);
			shogi.move(7, 3, 7, 4);
			shogi.move(7, 5, 7, 4);
			shogi.move(8, 1, 7, 3);
			shogi.move(7, 4, 7, 3, true);
			shogi.move(8, 2, 7, 2);
			shogi.move(7, 3, 8, 3);
			assert.equal(shogi.toSFENString(12),
				"l1sgkg1nl/2r4s1/p+P1ppp1pp/6p2/9/9/PP1PPPPPP/7R1/LNSGKGSNL w BN2Pb 12");
			shogi.move(7, 2, 7, 9, true);
			assert.equal(shogi.toSFENString(13),
				"l1sgkg1nl/7s1/p+P1ppp1pp/6p2/9/9/PP1PPPPPP/7R1/LN+rGKGSNL b BN2Pbs 13");
		});
	});
	describe("getMovesFrom", function(){
		it("just", function () {
			assert.deepEqual(shogi.getMovesFrom(7, 7), [{from:{x:7,y:7},to:{x:7,y:6}}]);
			assert.deepEqual(sortMove(shogi.getMovesFrom(5, 9)), sortMove([
				{from:{x:5,y:9},to:{x:4,y:8}},
				{from:{x:5,y:9},to:{x:5,y:8}},
				{from:{x:5,y:9},to:{x:6,y:8}},
			]));
			assert.deepEqual(sortMove(shogi.getMovesFrom(4, 9)), sortMove([
				{from:{x:4,y:9},to:{x:3,y:8}},
				{from:{x:4,y:9},to:{x:4,y:8}},
				{from:{x:4,y:9},to:{x:5,y:8}},
			]));
			assert.deepEqual(shogi.getMovesFrom(8, 9), []);
		});
		it("fly", function () {
			assert.deepEqual(shogi.getMovesFrom(1, 1), [{from:{x:1,y:1},to:{x:1,y:2}}]);
			assert.deepEqual(sortMove(shogi.getMovesFrom(2, 8)), sortMove([
				{from:{x:2,y:8},to:{x:1,y:8}},
				{from:{x:2,y:8},to:{x:3,y:8}},
				{from:{x:2,y:8},to:{x:4,y:8}},
				{from:{x:2,y:8},to:{x:5,y:8}},
				{from:{x:2,y:8},to:{x:6,y:8}},
				{from:{x:2,y:8},to:{x:7,y:8}}
			]));
		});
		it("just & fly", function () {
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			assert.deepEqual(sortMove(shogi.getMovesFrom(2, 2)), sortMove([
				{from:{x:2,y:2},to:{x:1,y:1}},
				{from:{x:2,y:2},to:{x:1,y:2}},
				{from:{x:2,y:2},to:{x:1,y:3}},
				{from:{x:2,y:2},to:{x:2,y:1}},
				{from:{x:2,y:2},to:{x:2,y:3}},
				{from:{x:2,y:2},to:{x:3,y:1}},
				{from:{x:2,y:2},to:{x:3,y:2}},
				{from:{x:2,y:2},to:{x:3,y:3}},
				{from:{x:2,y:2},to:{x:4,y:4}},
				{from:{x:2,y:2},to:{x:5,y:5}},
				{from:{x:2,y:2},to:{x:6,y:6}},
				{from:{x:2,y:2},to:{x:7,y:7}},
				{from:{x:2,y:2},to:{x:8,y:8}}
			]));
		});
		it("empty", function () {
			assert.deepEqual(shogi.getMovesFrom(7, 6), []);
		});
		it("初期局面の移動可能手", function() {
			var movable = 0;
			for (var i = 1; i <= 9; i++) {
				for (var j = 1; j <= 9; j++) {
					var move = shogi.getMovesFrom(i, j);
					movable += move.length;
				}
			}
			assert.equal(movable, 60);
		});
		describe("Piece.getMoveDef", function(){
			it("RY", function(){
				shogi.move(7, 7, 7, 6);
				shogi.move(4, 3, 4, 4);
				shogi.move(8, 8, 4, 4);
				shogi.move(8, 2, 4, 2);
				shogi.move(4, 4, 5, 3, true);
				shogi.move(4, 2, 4, 7, true);
				assert.deepEqual(sortMove(shogi.getMovesFrom(4, 7)), sortMove([
					{from:{x:4,y:7},to:{x:4,y:2}},
					{from:{x:4,y:7},to:{x:4,y:3}},
					{from:{x:4,y:7},to:{x:4,y:4}},
					{from:{x:4,y:7},to:{x:4,y:5}},
					{from:{x:4,y:7},to:{x:4,y:6}},
					{from:{x:4,y:7},to:{x:4,y:8}},
					{from:{x:4,y:7},to:{x:4,y:9}},
					{from:{x:4,y:7},to:{x:3,y:6}},
					{from:{x:4,y:7},to:{x:3,y:7}},
					{from:{x:4,y:7},to:{x:3,y:8}},
					{from:{x:4,y:7},to:{x:5,y:6}},
					{from:{x:4,y:7},to:{x:5,y:7}},
					{from:{x:4,y:7},to:{x:5,y:8}}
				]));
			});
		});
	});
	describe("getDropsBy", function(){
		it("normal", function () {
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			assert.deepEqual(sortMove(shogi.getDropsBy(Color.Black)), sortMove([
				{to:{x:1,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:1,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:1,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:1,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:1,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:2,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:2,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:2,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:3,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:3,y:3}, color: Color.Black, kind: "KA"},
				{to:{x:3,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:3,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:3,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:4,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:4,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:4,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:4,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:4,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:5,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:5,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:5,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:5,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:5,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:6,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:6,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:6,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:6,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:6,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:7,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:7,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:7,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:7,y:7}, color: Color.Black, kind: "KA"},
				{to:{x:7,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:8,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:8,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:8,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:8,y:8}, color: Color.Black, kind: "KA"},
				{to:{x:9,y:2}, color: Color.Black, kind: "KA"},
				{to:{x:9,y:4}, color: Color.Black, kind: "KA"},
				{to:{x:9,y:5}, color: Color.Black, kind: "KA"},
				{to:{x:9,y:6}, color: Color.Black, kind: "KA"},
				{to:{x:9,y:8}, color: Color.Black, kind: "KA"},
			]));
			assert.deepEqual(shogi.getDropsBy(Color.White), []);
		});
		it("same pieces in hand", function () {
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			shogi.drop(3, 3, "KA");
			shogi.move(2, 2, 3, 3);
			assert.deepEqual(sortMove(shogi.getDropsBy(Color.White)), sortMove([
				{to:{x:1,y:2}, color: Color.White, kind: "KA"},
				{to:{x:1,y:4}, color: Color.White, kind: "KA"},
				{to:{x:1,y:5}, color: Color.White, kind: "KA"},
				{to:{x:1,y:6}, color: Color.White, kind: "KA"},
				{to:{x:1,y:8}, color: Color.White, kind: "KA"},
				{to:{x:2,y:2}, color: Color.White, kind: "KA"},
				{to:{x:2,y:4}, color: Color.White, kind: "KA"},
				{to:{x:2,y:5}, color: Color.White, kind: "KA"},
				{to:{x:2,y:6}, color: Color.White, kind: "KA"},
				{to:{x:3,y:1}, color: Color.White, kind: "KA"},
				{to:{x:3,y:2}, color: Color.White, kind: "KA"},
				{to:{x:3,y:5}, color: Color.White, kind: "KA"},
				{to:{x:3,y:6}, color: Color.White, kind: "KA"},
				{to:{x:3,y:8}, color: Color.White, kind: "KA"},
				{to:{x:4,y:2}, color: Color.White, kind: "KA"},
				{to:{x:4,y:4}, color: Color.White, kind: "KA"},
				{to:{x:4,y:5}, color: Color.White, kind: "KA"},
				{to:{x:4,y:6}, color: Color.White, kind: "KA"},
				{to:{x:4,y:8}, color: Color.White, kind: "KA"},
				{to:{x:5,y:2}, color: Color.White, kind: "KA"},
				{to:{x:5,y:4}, color: Color.White, kind: "KA"},
				{to:{x:5,y:5}, color: Color.White, kind: "KA"},
				{to:{x:5,y:6}, color: Color.White, kind: "KA"},
				{to:{x:5,y:8}, color: Color.White, kind: "KA"},
				{to:{x:6,y:2}, color: Color.White, kind: "KA"},
				{to:{x:6,y:4}, color: Color.White, kind: "KA"},
				{to:{x:6,y:5}, color: Color.White, kind: "KA"},
				{to:{x:6,y:6}, color: Color.White, kind: "KA"},
				{to:{x:6,y:8}, color: Color.White, kind: "KA"},
				{to:{x:7,y:2}, color: Color.White, kind: "KA"},
				{to:{x:7,y:4}, color: Color.White, kind: "KA"},
				{to:{x:7,y:5}, color: Color.White, kind: "KA"},
				{to:{x:7,y:7}, color: Color.White, kind: "KA"},
				{to:{x:7,y:8}, color: Color.White, kind: "KA"},
				{to:{x:8,y:4}, color: Color.White, kind: "KA"},
				{to:{x:8,y:5}, color: Color.White, kind: "KA"},
				{to:{x:8,y:6}, color: Color.White, kind: "KA"},
				{to:{x:8,y:8}, color: Color.White, kind: "KA"},
				{to:{x:9,y:2}, color: Color.White, kind: "KA"},
				{to:{x:9,y:4}, color: Color.White, kind: "KA"},
				{to:{x:9,y:5}, color: Color.White, kind: "KA"},
				{to:{x:9,y:6}, color: Color.White, kind: "KA"},
				{to:{x:9,y:8}, color: Color.White, kind: "KA"},
			]));
		});
	});
	describe("getMovesTo", function(){
		it("just", function () {
			assert.deepEqual(shogi.getMovesTo(7, 6, "FU"), [{from:{x:7,y:7},to:{x:7,y:6}}]);
		});
		it("fly", function () {
			shogi.move(7, 7, 7, 6);
			assert.deepEqual(shogi.getMovesTo(1, 2, "KY"), [{from:{x:1,y:1},to:{x:1,y:2}}]);
		});
		it("color parameter", function () {
			assert.deepEqual(shogi.getMovesTo(1, 2, "KY", Color.Black), []);
			assert.deepEqual(shogi.getMovesTo(1, 2, "KY", Color.White), [{from:{x:1,y:1},to:{x:1,y:2}}]);
		});
	});
	describe("getHandsSummary", function(){
		it("normal", function () {
			assert.deepEqual(shogi.getHandsSummary(Color.Black), {
				"FU": 0,
				"KY": 0,
				"KE": 0,
				"GI": 0,
				"KI": 0,
				"KA": 0,
				"HI": 0
			});
			shogi.move(7, 7, 7, 6);
			shogi.move(3, 3, 3, 4);
			shogi.move(8, 8, 2, 2, true);
			shogi.move(3, 1, 2, 2);
			assert.deepEqual(shogi.getHandsSummary(Color.Black), {
				"FU": 0,
				"KY": 0,
				"KE": 0,
				"GI": 0,
				"KI": 0,
				"KA": 1,
				"HI": 0
			});
			shogi.drop(3, 3, "KA");
			shogi.move(2, 2, 3, 3);
			assert.deepEqual(shogi.getHandsSummary(Color.White), {
				"FU": 0,
				"KY": 0,
				"KE": 0,
				"GI": 0,
				"KI": 0,
				"KA": 2,
				"HI": 0
			});
		});
	});
	describe("captureByColor", function(){
		it("normal", function () {
			shogi.editMode(true);
			shogi.captureByColor(7, 7, Color.Black);
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+00FU",
				"P-",
				"+"].join("\n"));
			shogi.captureByColor(8, 8, Color.White);
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU * +FU+FU+FU+FU+FU+FU",
				"P8 *  *  *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+00FU",
				"P-00KA",
				"+"].join("\n"));
		});
		it("error", function () {
			assert.throws(function(){
				shogi.captureByColor(7, 7, Color.Black);
			});
		});
	});
	describe("flip", function(){
		it("normal", function () {
			shogi.editMode(true);
			assert(shogi.flip(7, 7));
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+TO+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
			assert(shogi.flip(7, 7));
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU-FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
			assert(shogi.flip(7, 7));
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU-TO+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
			assert(shogi.flip(7, 7));
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
		});
		it("kin", function () {
			shogi.editMode(true);
			assert(shogi.flip(6, 9));
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI-KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
			assert(shogi.flip(6, 9));
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"+"].join("\n"));
		});
		it("fail", function () {
			shogi.editMode(true);
			assert.equal(shogi.flip(7, 6), false);
		});
		it("error", function () {
			assert.throws(function(){
				shogi.flip(7, 7);
			});
		});
	});
	describe("setTurn", function(){
		it("normal", function () {
			var csaString = shogi.toCSAString();
			shogi.editMode(true);
			shogi.setTurn(Color.White);
			assert.equal(shogi.toCSAString(), [
				"P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
				"P2 * -HI *  *  *  *  * -KA * ",
				"P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
				"P4 *  *  *  *  *  *  *  *  * ",
				"P5 *  *  *  *  *  *  *  *  * ",
				"P6 *  *  *  *  *  *  *  *  * ",
				"P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
				"P8 * +KA *  *  *  *  * +HI * ",
				"P9+KY+KE+GI+KI+OU+KI+GI+KE+KY",
				"P+",
				"P-",
				"-"].join("\n"));
			shogi.setTurn(Color.Black);
			assert.equal(shogi.toCSAString(), csaString);
		});
		it("error", function () {
			assert.throws(function(){
				shogi.setTurn(Color.White);
			});
		});
	});
});
