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
				{move:{from:p(7,7),to:p(7,6), piece:"FU"}},
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
	});

	describe("normalizeKIF", function(){
		it("no move", function(){
			Normalizer.normalizeKIF({
				header: {},
				moves:[

				]
			})
		});
	});
});
