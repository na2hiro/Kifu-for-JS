var assert = require('assert');
var ki2Parser = require("../out/ki2-parser.js");

function p(x, y){
	return {x:x,y:y};
}
describe("ki2-parser", function(){
	it("simple", function(){
		assert.deepEqual(ki2Parser.parse("▲７六歩 △３四歩 ▲２二角成 △同　銀 ▲４五角"),{
			header:{},
			moves:[
				{},
				{move:{to:p(7,6),piece:"FU"}},
				{move:{to:p(3,4),piece:"FU"}},
				{move:{to:p(2,2),piece:"KA",promote:true}},
				{move:{same:true,piece:"GI"}},
				{move:{to:p(4,5),piece:"KA"}},
			]
		});
	});
	it("comment", function(){
		assert.deepEqual(ki2Parser.parse("*開始時コメント\n▲７六歩\n*初手コメント\n*初手コメント2\n△３四歩 ▲２二角成"),{
			header:{},
			moves:[
				{comments:["開始時コメント"]},
				{move:{to:p(7,6),piece:"FU"},comments:["初手コメント", "初手コメント2"]},
				{move:{to:p(3,4),piece:"FU"}},
				{move:{to:p(2,2),piece:"KA",promote:true}},
			]
		});
	});
	it("special", function(){
		assert.deepEqual(ki2Parser.parse("▲７六歩 △３四歩 ▲７八銀 △８八角成\nまで4手で後手の勝ち\n"),{
			header:{},
			moves:[
				{},
				{move:{to:p(7,6),piece:"FU"}},
				{move:{to:p(3,4),piece:"FU"}},
				{move:{to:p(7,8),piece:"GI"}},
				{move:{to:p(8,8),piece:"KA",promote:true}},
				{special:"TORYO"},
			]
		});
	});
	describe("header", function(){
		it("手合割", function(){
			assert.deepEqual(ki2Parser.parse("手合割：平手\n▲７六歩 △３四歩 ▲２二角成 △同　銀 ▲４五角"),{
				header:{
					"手合割":"平手",
				},
				initial: {preset: "HIRATE"},
				moves:[
					{},
					{move:{to:p(7,6),piece:"FU"}},
					{move:{to:p(3,4),piece:"FU"}},
					{move:{to:p(2,2),piece:"KA",promote:true}},
					{move:{same:true,piece:"GI"}},
					{move:{to:p(4,5),piece:"KA"}},
				]
			});
			assert.deepEqual(ki2Parser.parse("手合割：六枚落ち\n△４二玉 ▲７六歩 △２二銀 ▲６六角 △８二銀"),{
				header:{
					"手合割":"六枚落ち",
				},
				initial: {preset: "6"},
				moves:[
					{},
					{move:{to:p(4,2),piece:"OU"}},
					{move:{to:p(7,6),piece:"FU"}},
					{move:{to:p(2,2),piece:"GI"}},
					{move:{to:p(6,6),piece:"KA"}},
					{move:{to:p(8,2),piece:"GI"}},
				]
			});
		});
	});
	describe("initial", function(){
		it("simple", function(){

			assert.deepEqual(ki2Parser.parse("\
手合割：その他　\n\
上手の持駒：銀四　桂四　\n\
  ９ ８ ７ ６ ５ ４ ３ ２ １\n\
+---------------------------+\n\
| ・ ・ ・ ・ ・ ・ ・v歩v玉|一\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|二\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|三\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|四\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|五\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|六\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|七\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|八\n\
| ・ ・ ・ ・ ・ ・ ・v歩 ・|九\n\
+---------------------------+\n\
下手の持駒：飛二　香四　\n\
下手番\n\
下手：shitate\n\
上手：uwate\n\
▲１三香 △１二桂 ▲同香成"),{
				header:{
					"手合割":"その他　",
					"上手":"uwate",
					"下手":"shitate",
				},
				initial: {
					preset:"OTHER",
					data:{
						board:[
							[{color:false,kind:"OU"},{},{},{},{},{},{},{},{}],
							[{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"},{color:false,kind:"FU"}],
							[{},{},{},{},{},{},{},{},{}],
							[{},{},{},{},{},{},{},{},{}],
							[{},{},{},{},{},{},{},{},{}],
							[{},{},{},{},{},{},{},{},{}],
							[{},{},{},{},{},{},{},{},{}],
							[{},{},{},{},{},{},{},{},{}],
							[{},{},{},{},{},{},{},{},{}],
						],
						color: true,
						hands:[
							{FU:0,KY:4,KE:0,GI:0,KI:0,KA:0,HI:2},
							{FU:0,KY:0,KE:4,GI:4,KI:0,KA:0,HI:0},
						]
					}
				},
				moves:[
					{},
					{move:{to:p(1,3),piece:"KY"}},
					{move:{to:p(1,2),piece:"KE"}},
					{move:{same:true,piece:"KY",promote:true}},
				]
			});
		});
	});
	describe("fork", function(){
		it("normal", function(){
			assert.deepEqual(ki2Parser.parse("\
手合割：平手\n\
▲７六歩 △３四歩 ▲２二角成 △同　銀 ▲４五角\n\
まで5手で中断\n\
\n\
変化：3手\n\
▲６六歩 △８四歩\
"),{
				header:{
					"手合割":"平手",
				},
				initial: {preset: "HIRATE"},
				moves:[
					{},
					{move:{to:p(7,6),piece:"FU"}},
					{move:{to:p(3,4),piece:"FU"}},
					{move:{to:p(2,2),piece:"KA",promote:true},forks:[
						[
//							{},
							{move:{to:p(6,6),piece:"FU"}},
							{move:{to:p(8,4),piece:"FU"}},
						]
					]},
					{move:{same:true,piece:"GI"}},
					{move:{to:p(4,5),piece:"KA"}},
					{special:"CHUDAN"},
				]
			});
		});
	});
});
