var assert = require('assert');
var ShogiJS = require('../lib/shogi.js');
var Piece = ShogiJS.Piece;

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

describe("class Piece", function(){
	describe("promote", function(){
		it("normal", function(){
			var fu = new Piece("+FU");
			fu.promote();
			assert.equal(new Piece("+TO").toCSAString(), fu.toCSAString());
			fu.promote();
			assert.equal(new Piece("+TO").toCSAString(), fu.toCSAString());
		});
	});
	describe("unpromote", function(){
		it("normal", function(){
			var ky = new Piece("+KY");
			ky.promote();
			ky.unpromote();
			assert.equal(new Piece("+KY").toCSAString(), ky.toCSAString());
			ky.unpromote();
			assert.equal(new Piece("+KY").toCSAString(), ky.toCSAString());
		});
	});
	describe("unpromote", function(){
		it("normal", function(){
			var ke = new Piece("+KE");
			ke.inverse();
			assert.equal(new Piece("-KE").toCSAString(), ke.toCSAString());
			ke.inverse();
			assert.equal(new Piece("+KE").toCSAString(), ke.toCSAString());
		});
	});
	describe("toCSAString", function(){
		it("normal", function(){
			var gi = new Piece("+GI");
			assert.equal(gi.toCSAString(), "+GI");
		});
	});
	describe("toSFENString", function(){
		it("normal", function(){
			assert.equal(new Piece("+GI").toSFENString(), "S");
			assert.equal(new Piece("-GI").toSFENString(), "s");
			assert.equal(new Piece("+TO").toSFENString(), "+P");
			assert.equal(new Piece("-TO").toSFENString(), "+p");
		})
	})
	describe("static promote", function(){
		it("normal", function(){
			assert.equal(Piece.promote("KA"), "UM");
			assert.equal(Piece.promote("UM"), "UM");
			assert.equal(Piece.promote("KI"), "KI");
		});
	});
	describe("static unpromote", function(){
		it("normal", function(){
			assert.equal(Piece.unpromote("RY"), "HI");
			assert.equal(Piece.unpromote("HI"), "HI");
			assert.equal(Piece.unpromote("OU"), "OU");
		});
	});
	describe("static canPromote", function(){
		it("normal", function(){
			assert.equal(Piece.canPromote("KA"), true);
			assert.equal(Piece.canPromote("UM"), false);
			assert.equal(Piece.canPromote("KI"), false);
		});
	});
});
