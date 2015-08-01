var assert = require('assert');
var Normalizer = require('../lib/normalizer.js');

function p(x, y){
	return {x:x,y:y};
}
describe("module Normalizer", function(){
	describe("normalizeMinimal", function(){
		var actual, expected;
		beforeEach(function(){
			actual = {
				header: {},
				moves: [{}]
			};
			expected = {
				header: {},
				moves: [{}]
			};
		});
		it("no move", function(){
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
			actual.moves.pop();
			expected.moves.pop();
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("normal", function(){
			actual.moves[1] = {move:{from:p(7,7),to:p(7,6)}};
			expected.moves[1] = {move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}};
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
        });
		it("same, capture", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6)}},
				{move:{from:p(4,3),to:p(4,4)}},
				{move:{from:p(8,8),to:p(4,4)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(4,3),to:p(4,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(4,4),color:true,piece:"KA",same:true,capture:"FU"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("promote:false, drop", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6)}},
				{move:{from:p(3,3),to:p(3,4)}},
				{move:{from:p(8,8),to:p(2,2)}},
				{move:{from:p(3,1),to:p(2,2)}},
				{move:{piece:"KA",to:p(4,5)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
				{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
				{move:{to:p(4,5),color:true,piece:"KA"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
        it("hit, with piece", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6)}},
				{move:{from:p(3,3),to:p(3,4)}},
                {move:{from:p(8,9),to:p(7,7)}},
				{move:{from:p(2,2),to:p(7,7),promote:true}},
				{move:{from:p(8,8),to:p(7,7)}},
				{move:{piece:"KE",to:p(3,3)}}
            );
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("fork", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6), piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4)}},
				{move:{from:p(8,9),to:p(7,7)}, forks:[
					[
						{},
						{move:{from:p(8,8),to:p(2,2)}},
                        {move:{from:p(3,1),to:p(2,2)}},
                        {move:{piece:"KA",to:p(4,5)}}
					]
				]},
				{move:{from:p(2,2),to:p(7,7),promote:true}},
				{move:{from:p(8,8),to:p(7,7)}},
				{move:{piece:"KE",to:p(3,3)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}, forks:[
					[
						{},
						{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
						{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
						{move:{to:p(4,5),color:true,piece:"KA"}}
					]
				]},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
        it("error", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6)}},
				{move:{from:p(3,3),to:p(3,2)}}
            );
			assert.throws(function(){
				Normalizer.normalizeMinimal(actual);
			});
		});
	});

	describe("normalizeKIF", function(){
		var actual, expected;
		beforeEach(function(){
			actual = {
				header: {},
				moves: [{}]
			};
			expected = {
				header: {},
				moves: [{}]
			};
		});
		it("no move", function(){
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
			actual.moves.pop();
			expected.moves.pop();
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("normal", function(){
			actual.moves[1] = {move:{from:p(7,7),to:p(7,6),piece:"FU"}};
			expected.moves[1] = {move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}};
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("same, capture", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(4,3),to:p(4,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(4,4),piece:"KA",same:true}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(4,3),to:p(4,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(4,4),color:true,piece:"KA",same:true,capture:"FU"}}
			);
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("promote:false, drop", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"KA"}},
				{move:{from:p(3,1),piece:"GI",same:true}},
				{move:{piece:"KA",to:p(4,5)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
				{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
				{move:{to:p(4,5),color:true,piece:"KA"}}
			);
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("hit, with piece", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),piece:"KE"}},
				{move:{from:p(2,2),piece:"KA",promote:true,same:true}},
				{move:{from:p(8,8),piece:"KA",same:true}},
				{move:{piece:"KE",to:p(3,3)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("fork", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),piece:"KE"}, forks:[
					[
						{},
						{move:{from:p(8,8),to:p(2,2),piece:"KA"}},
						{move:{from:p(3,1),same:true,piece:"GI"}},
						{move:{piece:"KA",to:p(4,5)}}
					]
				]},
				{move:{from:p(2,2),same:true,piece:"KA",promote:true}},
				{move:{from:p(8,8),same:true,piece:"KA"}},
				{move:{piece:"KE",to:p(3,3)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}, forks:[
					[
						{},
						{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
						{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
						{move:{to:p(4,5),color:true,piece:"KA"}}
					]
				]},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
        it("error", function(){
			actual.moves.push(
				{move:{from:p(7,6),to:p(6,6),piece:"FU"}}
            );
			assert.throws(function(){
				Normalizer.normalizeKIF(actual);
			});
		});
	});
	describe("normalizeKI2", function() {
		var actual, expected;
		beforeEach(function () {
			actual = {
				header: {},
				moves: [{}]
			};
			expected = {
				header: {},
				moves: [{}]
			};
		});
		it("no move", function () {
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
			actual.moves.pop();
			expected.moves.pop();
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
		});
		it("normal", function () {
			actual.moves[1] = {move: {to: p(7, 6), piece: "FU"}};
			expected.moves[1] = {move: {from: p(7, 7), to: p(7, 6), color: true, piece: "FU"}};
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
		});
		it("same, capture", function () {
			actual.moves.push(
				{move: {to: p(7, 6), piece: "FU"}},
				{move: {to: p(4, 4), piece: "FU"}},
				{move: {to: p(4, 4), piece: "KA", same: true}}
			);
			expected.moves.push(
				{move: {from: p(7, 7), to: p(7, 6), color: true, piece: "FU"}},
				{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
				{move: {from: p(8, 8), to: p(4, 4), color: true, piece: "KA", same: true, capture: "FU"}}
			);
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
		});
		it("hit, with piece", function(){
			actual.moves.push(
				{move:{to:p(7,6),piece:"FU"}},
				{move:{to:p(3,4),piece:"FU"}},
				{move:{to:p(7,7),piece:"KE"}},
				{move:{piece:"KA",promote:true,same:true}},
				{move:{piece:"KA",same:true}},
				{move:{piece:"KE",to:p(3,3),relative:"H"}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
		});
		it("promote:false, drop", function(){
			actual.moves.push(
				{move:{to:p(7,6),piece:"FU"}},
				{move:{to:p(3,4),piece:"FU"}},
				{move:{to:p(2,2),piece:"KA",promote:false}},
				{move:{piece:"GI",same:true}},
				{move:{piece:"KA",to:p(4,5)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
				{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
				{move:{to:p(4,5),color:true,piece:"KA"}}
			);
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
		});
		describe("relative", function(){
			it("normal", function () {
				actual.moves.push(
					{move: {to: p(5, 8), piece: "KI",relative:"R"}}
				);
				expected.moves.push(
					{move: {from: p(4, 9), to: p(5, 8), color: true, piece: "KI",relative:"R"}}
				);
				assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
			});
			it("insufficient", function () {
				actual.moves.push(
					{move: {to: p(5, 8), piece: "KI"}}
				);
				assert.throws(function(){
					Normalizer.normalizeKI2(actual)
				});
			});
			it("malformed", function () {
				actual.moves.push(
					{move: {to: p(5, 8), piece: "KI",relative:"C"}}
				);
				assert.throws(function(){
					Normalizer.normalizeKI2(actual)
				});
			});
		});
		it("fork", function(){
			actual.moves.push(
				{move:{to:p(7,6),piece:"FU"}},
				{move:{to:p(3,4),piece:"FU"}},
				{move:{to:p(7,7),piece:"KE"}, forks:[
					[
						{},
						{move:{to:p(2,2),piece:"KA",promote:false}},
						{move:{same:true,piece:"GI"}},
						{move:{piece:"KA",to:p(4,5)}}
					]
				]},
				{move:{same:true,piece:"KA",promote:true}},
				{move:{same:true,piece:"KA"}},
				{move:{piece:"KE",to:p(3,3),relative:"H"}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}, forks:[
					[
						{},
						{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
						{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
						{move:{to:p(4,5),color:true,piece:"KA"}}
					]
				]},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
		});
		describe("moveSatisfiesRelative", function() {
			var actual, expected;
			beforeEach(function () {
				actual = {
					header: {},
					moves: [{}]
				};
				expected = {
					header: {},
					moves: [{}]
				};
			});
			it("L", function () {
				actual.moves.push(
					{move: {piece:"KI",to: p(5, 8),relative:"L"}}
				);
				expected.moves.push(
					{move: {from: p(6, 9), to: p(5, 8), color: true, piece: "KI", relative:"L"}}
				);
				assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
			});
			it("U", function () {
				actual.moves.push(
					{move: {to: p(4, 8),piece:"KI"}},
					{move: {to: p(4, 4),piece:"FU"}},
					{move: {to: p(5, 8),piece:"KI",relative:"U"}}
				);
				expected.moves.push(
					{move: {from: p(4, 9), to: p(4, 8), color: true, piece: "KI"}},
					{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
					{move: {from: p(6, 9), to: p(5, 8), color: true, piece: "KI", relative:"U"}}
				);
				assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
			});
			it("M", function () {
				actual.moves.push(
					{move: {to: p(4, 8),piece:"KI"}},
					{move: {to: p(4, 4),piece:"FU"}},
					{move: {to: p(5, 8),piece:"KI",relative:"M"}}
				);
				expected.moves.push(
					{move: {from: p(4, 9), to: p(4, 8), color: true, piece: "KI"}},
					{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
					{move: {from: p(4, 8), to: p(5, 8), color: true, piece: "KI", relative:"M"}}
				);
				assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
			});
			it("D", function () {
				actual.moves.push(
					{move: {to: p(5, 8),piece:"KI",relative:"R"}},
					{move: {to: p(4, 4),piece:"FU"}},
					{move: {to: p(4, 8),piece:"OU"}},
					{move: {to: p(4, 5),piece:"FU"}},
					{move: {to: p(5, 9),piece:"KI",relative:"D"}}
				);
				expected.moves.push(
					{move: {from: p(4, 9), to: p(5, 8), color: true, piece: "KI", relative:"R"}},
					{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
					{move: {from: p(5, 9), to: p(4, 8), color: true, piece: "OU"}},
					{move: {from: p(4, 4), to: p(4, 5), color: false, piece: "FU"}},
					{move: {from: p(5, 8), to: p(5, 9), color: true, piece: "KI", relative:"D"}}
				);
				assert.deepEqual(Normalizer.normalizeKI2(actual), expected);
			});
			it("no C for UM and RY", function () {
				actual.moves.push(
						{move: {from: p(7, 7), to: p(7, 6)}},
						{move: {from: p(3, 3), to: p(3, 4)}},
						{move: {from: p(8, 8), to: p(2, 2),promote:true}},
						{move: {from: p(4, 1), to: p(3, 2)}},
						{move: {piece:"KA",to: p(4, 1)}},
						{move: {from: p(9, 3), to: p(9,4)}},
						{move: {from: p(4, 1), to: p(3, 2),piece:"KA",promote:true}},
						{move: {from: p(9, 4), to: p(9, 5),piece:"FU"}},
						{move: {from: p(2, 2), to: p(2, 1),piece:"UM"}}
						);
				expected.moves.push(
						{move: {from: p(7, 7), to: p(7, 6),piece:"FU",color:true}},
						{move: {from: p(3, 3), to: p(3, 4),piece:"FU",color:false}},
						{move: {from: p(8, 8), to: p(2, 2),promote:true,piece:"KA",capture:"KA",color:true}},
						{move: {from: p(4, 1), to: p(3, 2),piece:"KI",color:false}},
						{move: {piece:"KA", to: p(4, 1),piece:"KA",color:true}},
						{move: {from: p(9, 3), to: p(9,4),piece:"FU",color:false}},
						{move: {from: p(4,1), to: p(3, 2),piece:"KA", color:true,promote:true,capture:"KI"}},
						{move: {from: p(9, 4), to: p(9,5),piece:"FU",color:false}},
						{move: {from: p(2,2), to: p(2, 1),color:true,piece:"UM",relative:"R",capture:"KE"}}
						);
				assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
			});
		});
        it("error", function(){
			actual.moves.push(
				{move:{from:p(7,6),to:p(7,5),piece:"FU"}}
            );
			assert.throws(function(){
				Normalizer.normalizeKI2(actual);
			});
		});
	});
	describe("normalizeCSA", function() {
		var actual, expected;
		beforeEach(function () {
			actual = {
				header: {},
				moves: [{}]
			};
			expected = {
				header: {},
				moves: [{}]
			};
		});
		it("no move", function () {
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
			actual.moves.pop();
			expected.moves.pop();
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("normal", function () {
			actual.moves[1] = {move: {from: p(7, 7), to: p(7, 6), piece: "FU"}};
			expected.moves[1] = {move: {from: p(7, 7), to: p(7, 6), color: true, piece: "FU"}};
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("same, capture", function () {
			actual.moves.push(
				{move: {from: p(7, 7), to: p(7, 6), piece: "FU"}},
				{move: {from: p(4, 3), to: p(4, 4), piece: "FU"}},
				{move: {from: p(8, 8), to: p(4, 4), piece: "KA"}}
			);
			expected.moves.push(
				{move: {from: p(7, 7), to: p(7, 6), color: true, piece: "FU"}},
				{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
				{move: {from: p(8, 8), to: p(4, 4), color: true, piece: "KA", same: true, capture: "FU"}}
			);
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("hit, promote", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),piece:"KE"}},
				{move:{from:p(2,2),to:p(7,7),piece:"UM"}},
				{move:{from:p(8,8),to:p(7,7),piece:"KA"}},
				{move:{piece:"KE",to:p(3,3)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,9),to:p(7,7),color:true,piece:"KE"}},
				{move:{from:p(2,2),to:p(7,7),color:false,piece:"KA",capture:"KE",promote:true,same:true}},
				{move:{from:p(8,8),to:p(7,7),color:true,piece:"KA",capture:"UM",same:true}},
				{move:{to:p(3,3),color:false,piece:"KE",relative:"H"}}
			);
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("promote:false, drop", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"KA"}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
				{move:{piece:"KA",to:p(4,5)}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:false}},
				{move:{from:p(3,1),to:p(2,2),color:false,piece:"GI",capture:"KA",same:true}},
				{move:{to:p(4,5),color:true,piece:"KA"}}
			);
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("keep promote", function(){
			actual.moves.push(
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"}},
				{move:{from:p(4,1),to:p(4,2),piece:"KI"}},
				{move:{from:p(2,2),to:p(1,1),piece:"UM"}}
			);
			expected.moves.push(
				{move:{from:p(7,7),to:p(7,6),color:true,piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),color:false,piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),color:true,piece:"KA",capture:"KA",promote:true}},
				{move:{from:p(4,1),to:p(4,2),color:false,piece:"KI"}},
				{move:{from:p(2,2),to:p(1,1),color:true,piece:"UM",capture:"KY"}}
			);
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
        it("error", function(){
			actual.moves.push(
				{move:{from:p(7,6),to:p(7,5),piece:"FU"}}
            );
			assert.throws(function(){
				Normalizer.normalizeCSA(actual);
			});
		});
	});
	describe("addRelativeInformation", function() {
		var actual, expected;
		beforeEach(function () {
			actual = {
				header: {},
				moves: [{}]
			};
			expected = {
				header: {},
				moves: [{}]
			};
		});
		it("U", function () {
			actual.moves.push(
				{move: {from: p(4, 9), to: p(4, 8)}},
				{move: {from: p(4, 3), to: p(4, 4)}},
				{move: {from: p(6, 9), to: p(5, 8)}}
			);
			expected.moves.push(
				{move: {from: p(4, 9), to: p(4, 8), color: true, piece: "KI"}},
				{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
				{move: {from: p(6, 9), to: p(5, 8), color: true, piece: "KI", relative:"U"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("M", function () {
			actual.moves.push(
				{move: {from: p(4, 9), to: p(4, 8)}},
				{move: {from: p(4, 3), to: p(4, 4)}},
				{move: {from: p(4, 8), to: p(5, 8)}}
			);
			expected.moves.push(
				{move: {from: p(4, 9), to: p(4, 8), color: true, piece: "KI"}},
				{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
				{move: {from: p(4, 8), to: p(5, 8), color: true, piece: "KI", relative:"M"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("D, L", function () {
			actual.moves.push(
				{move: {from: p(6, 9), to: p(5, 8),piece:"KI"}},
				{move: {from: p(4, 3), to: p(4, 4),piece:"FU"}},
				{move: {from: p(5, 9), to: p(4, 8),piece:"OU"}},
				{move: {from: p(4, 4), to: p(4, 5),piece:"FU"}},
				{move: {from: p(5, 8), to: p(5, 9),piece:"KI"}}
			);
			expected.moves.push(
				{move: {from: p(6, 9), to: p(5, 8), color: true, piece: "KI", relative:"L"}},
				{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
				{move: {from: p(5, 9), to: p(4, 8), color: true, piece: "OU"}},
				{move: {from: p(4, 4), to: p(4, 5), color: false, piece: "FU"}},
				{move: {from: p(5, 8), to: p(5, 9), color: true, piece: "KI", relative:"D"}}
			);
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("R", function () {
			actual.moves.push(
				{move: {from: p(4, 9), to: p(5, 8)}}
			);
			expected.moves.push(
				{move: {from: p(4, 9), to: p(5, 8), color: true, piece: "KI",relative:"R"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("RU", function () {
			actual.moves.push(
				{move: {from: p(7, 7), to: p(7, 6)}},
				{move: {from: p(3, 3), to: p(3, 4)}},
				{move: {from: p(8, 8), to: p(2, 2),promote:true}},
				{move: {from: p(4, 1), to: p(3, 2)}},
				{move: {from: p(2, 2), to: p(3, 2)}},
				{move: {from: p(3, 1), to: p(3, 2)}},
				{move: {piece:"KI", to: p(4, 8)}},
				{move: {from: p(3, 2), to: p(3, 3),piece:"GI"}},
				{move: {from: p(4,9), to: p(5, 8)}}
			);
			expected.moves.push(
				{move: {from: p(7, 7), to: p(7, 6),piece:"FU",color:true}},
				{move: {from: p(3, 3), to: p(3, 4),piece:"FU",color:false}},
				{move: {from: p(8, 8), to: p(2, 2),promote:true,piece:"KA",capture:"KA",color:true}},
				{move: {from: p(4, 1), to: p(3, 2),piece:"KI",color:false}},
				{move: {from: p(2, 2), to: p(3, 2),piece:"UM",color:true,capture:"KI",same:true}},
				{move: {from: p(3, 1), to: p(3, 2),piece:"GI",color:false,capture:"UM",same:true}},
				{move: {piece:"KI", to: p(4, 8),color:true,relative:"H"}},
				{move: {from: p(3, 2), to: p(3, 3),piece:"GI",color:false}},
				{move: {from: p(4,9), to: p(5, 8),color:true,piece:"KI",relative:"RU"}}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
		it("C", function () {
			actual.moves.push(
				{move: {from: p(5, 9), to: p(6, 8),piece:"OU"}},
				{move: {from: p(4, 3), to: p(4, 4),piece:"FU"}},
				{move: {from: p(6, 9), to: p(5, 9),piece:"KI"}},
				{move: {from: p(4, 4), to: p(4, 5),piece:"FU"}},
				{move: {from: p(4, 9), to: p(4, 8),piece:"KI"}}
			);
			expected.moves.push(
				{move: {from: p(5, 9), to: p(6, 8), color: true, piece: "OU"}},
				{move: {from: p(4, 3), to: p(4, 4), color: false, piece: "FU"}},
				{move: {from: p(6, 9), to: p(5, 9), color: true, piece: "KI", relative:"L"}},
				{move: {from: p(4, 4), to: p(4, 5), color: false, piece: "FU"}},
				{move: {from: p(4, 9), to: p(4, 8), color: true, piece: "KI", relative:"C"}}
			);
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("no C for UM and RY", function () {
			actual.moves.push(
				{move: {from: p(7, 7), to: p(7, 6)}},
				{move: {from: p(3, 3), to: p(3, 4)}},
				{move: {from: p(8, 8), to: p(2, 2),promote:true}},
				{move: {from: p(4, 1), to: p(3, 2)}},
				{move: {piece:"KA",to: p(4, 1)}},
				{move: {from: p(9, 3), to: p(9,4)}},
				{move: {from: p(4, 1), to: p(3, 2),piece:"KA",promote:true}},
                {move: {from: p(9, 4), to: p(9, 5),piece:"FU"}},
				{move: {from: p(2, 2), to: p(2, 1),piece:"UM"}, forks:[
					[{}, {move: {from: p(3, 2), to: p(3, 1),piece:"UM"}}]
				]}
			);
			expected.moves.push(
				{move: {from: p(7, 7), to: p(7, 6),piece:"FU",color:true}},
				{move: {from: p(3, 3), to: p(3, 4),piece:"FU",color:false}},
				{move: {from: p(8, 8), to: p(2, 2),promote:true,piece:"KA",capture:"KA",color:true}},
				{move: {from: p(4, 1), to: p(3, 2),piece:"KI",color:false}},
				{move: {piece:"KA", to: p(4, 1),piece:"KA",color:true}},
				{move: {from: p(9, 3), to: p(9,4),piece:"FU",color:false}},
				{move: {from: p(4,1), to: p(3, 2),piece:"KA", color:true,promote:true,capture:"KI"}},
				{move: {from: p(9, 4), to: p(9,5),piece:"FU",color:false}},
				{move: {from: p(2,2), to: p(2, 1),color:true,piece:"UM",relative:"R",capture:"KE"},forks:[
					[{}, {move: {from: p(3,2), to: p(3, 1),color:true,piece:"UM",relative:"L",capture:"GI"}}]
				]}
			);
			assert.deepEqual(Normalizer.normalizeMinimal(actual), expected);
		});
	});
	describe("restorePreset",function(){
		it("HIRATE", function(){
			var actual = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "KA" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "HI" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: true,
						hands:[
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			var expected = {
				header: {},
				initial: {preset: "HIRATE"},
				moves: [{}]
			};
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("HIRATE but different turn", function(){
			var actual = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "KA" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "HI" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: false,
						hands:[
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			var expected = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "KA" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "HI" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: false,
						hands:[
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("HIRATE but different hand", function(){
			var actual = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "KA" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "HI" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: false, 
						hands:[
							{FU:1,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			var expected = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "KA" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KE" }, { color: false, kind: "HI" }, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "KY" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: false,
						hands:[
							{FU:1,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("8", function(){
			var actual = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: false,
						hands:[
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			var expected = {
				header: {},
				initial: {preset: "8"},
				moves: [{}]
			};
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
		it("8 but different turn", function(){
			var actual = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: true,
						hands:[
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			var expected = {
				header: {},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "KA" }, { color: true, kind: "KE" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
						],
						color: true,
						hands:[
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
							{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
						]
					}
				},
				moves: [{}]
			};
			assert.deepEqual(Normalizer.normalizeCSA(actual), expected);
		});
	});
	describe("restoreColorOfIllegalAction", function(){
		it("normal", function(){
			var actual = {
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
					{special:"ILLEGAL_ACTION"},
				]
			};
			var expected = {
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),piece:"FU",color:true}},
					{special:"+ILLEGAL_ACTION"},
				]
			};
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
		it("fork", function(){
			var actual = {
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),piece:"FU"},forks:[
						[{}, {special:"ILLEGAL_ACTION"}],
						[{}, {move:{from:p(2,7),to:p(2,6),piece:"FU"}}, {special:"ILLEGAL_ACTION"}],
					]},
					{special:"ILLEGAL_ACTION"},
				]
			};
			var expected = {
				header: {},
				moves: [
					{},
					{move:{from:p(7,7),to:p(7,6),piece:"FU",color:true},forks:[
						[{}, {special:"-ILLEGAL_ACTION"}],
						[{}, {move:{from:p(2,7),to:p(2,6),piece:"FU",color:true}}, {special:"+ILLEGAL_ACTION"}],
					]},
					{special:"+ILLEGAL_ACTION"},
				]
			};
			assert.deepEqual(Normalizer.normalizeKIF(actual), expected);
		});
	});
});
