var assert = require('assert');
var csaParser = require("../out/csa-parser.js");

function p(x, y){
	return {x:x,y:y};
}
describe("csa-parser V2", function(){
	var initial;
	beforeEach(function(){
		initial = {
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
		};
	});
	it("simple", function(){
		assert.deepEqual(csaParser.parse("\
V2.2\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+8822UM\n\
-3122GI\n\
+0045KA\n"),{
			header:{},
			initial: initial, // normalizerがpresetを復元する
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
				{move:{to:p(4,5),piece:"KA"}},
			]
		});
	});
	it("comment", function(){
		assert.deepEqual(csaParser.parse("\
V2.2\n\
PI\n\
+\n\
'開始時コメント\n\
+7776FU\n\
'初手コメント\n\
'初手コメント2\n\
-3334FU\n\
+8822UM\n"),{
			header:{},
			initial: initial,
			moves:[
				{comments:["開始時コメント"]},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"},comments:["初手コメント", "初手コメント2"]},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"}},
			]
		});
	});
	it("special", function(){
		assert.deepEqual(csaParser.parse("\
V2.2\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n"),{
			header:{},
			initial: initial,
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(7,9),to:p(7,8),piece:"GI"}},
				{move:{from:p(2,2),to:p(8,8),piece:"UM"}},
				{special:"TORYO"},
			]
		});
	});
	it("comma", function(){
		assert.deepEqual(csaParser.parse("\
V2.2\n\
PI\n\
+\n\
+7776FU,T12,-3334FU,T2\n\
+8822UM,T100\n\
-3122GI,T1\n\
+0045KA,T0\n"),{
			header:{},
			initial: initial, // normalizerがpresetを復元する
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"},time:{now:{m:0,s:12}}}, // totalはnormalizerが復元
				{move:{from:p(3,3),to:p(3,4),piece:"FU"},time:{now:{m:0,s:2}}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"},time:{now:{m:1,s:40}}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"},time:{now:{m:0,s:1}}},
				{move:{to:p(4,5),piece:"KA"},time:{now:{m:0,s:0}}},
			]
		});
	});
	it("time", function(){
		assert.deepEqual(csaParser.parse("\
V2.2\n\
PI\n\
+\n\
+7776FU\n\
T12\n\
-3334FU\n\
T2\n\
+8822UM\n\
T100\n\
-3122GI\n\
T1\n\
+0045KA\n\
T0\n"),{
			header:{},
			initial: initial, // normalizerがpresetを復元する
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"},time:{now:{m:0,s:12}}}, // totalはnormalizerが復元
				{move:{from:p(3,3),to:p(3,4),piece:"FU"},time:{now:{m:0,s:2}}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"},time:{now:{m:1,s:40}}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"},time:{now:{m:0,s:1}}},
				{move:{to:p(4,5),piece:"KA"},time:{now:{m:0,s:0}}},
			]
		});
	});
	describe("開始局面", function(){
		it("平手初期局面", function(){
			assert.deepEqual(csaParser.parse("\
V2.2\n\
PI82HI22KA91KY81KE21KE11KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n"),{
				header:{},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
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
				moves:[
					{},
					{move:{from:p(5,1),to:p(4,2),piece:"OU"}},
					{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
					{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
					{move:{from:p(8,8),to:p(6,6),piece:"KA"}},
					{move:{from:p(7,1),to:p(8,2),piece:"GI"}},
				]
			});
		});
		it("一括表現", function(){
			assert.deepEqual(csaParser.parse("\
V2.2\n\
P1 *  * -GI-KI-OU-KI-GI *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3+FU+FU+FU+FU+FU+FU+FU+FU+FU\n\
P1 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n"),{
				header:{},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
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
				moves:[
					{},
					{move:{from:p(5,1),to:p(4,2),piece:"OU"}},
					{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
					{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
					{move:{from:p(8,8),to:p(6,6),piece:"KA"}},
					{move:{from:p(7,1),to:p(8,2),piece:"GI"}},
				]
			});
		});
		it("駒別単独表現", function(){
			assert.deepEqual(csaParser.parse("\
V2.2\n\
P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU\n\
P+00HI00HI00KY00KY00KY00KY\n\
P-00GI00GI00GI00GI00KE00KE00KE00KE\n\
+\n\
+0013KY\n\
-0012KE\n\
+1312NY\n"),{
				header:	{},
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
					{move:{from:p(1,3),to:p(1,2),piece:"NY"}},
				]
			});
		});
		it("AL", function(){
			assert.deepEqual(csaParser.parse("\
V2.2\n\
P+23FU\n\
P-11OU21KE\n\
P+00KI\n\
P-00AL\n\
+\n\
+0022KI\n\
%TSUMI\n"),{
				header:	{},
				initial: {
					preset:"OTHER",
					data:{
						board:[
							[{color:false,kind:"OU"},{},{},{},{},{},{},{},{}],
							[{color:false,kind:"KE"},{},{color:true,kind:"FU"},{},{},{},{},{},{}],
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
							{FU:0,KY:0,KE:0,GI:0,KI:1,KA:0,HI:0},
							{FU:17,KY:4,KE:3,GI:4,KI:3,KA:2,HI:2},
						]
					}
				},
				moves:[
					{},
					{move:{to:p(2,2),piece:"KI"}},
					{special: "TSUMI"},
				]
			});
		});
	});
	it("header", function(){
		assert.deepEqual(csaParser.parse("\
V2.2\n\
N+sente\n\
N-gote\n\
$SITE:将棋会館\n\
$START_TIME:2015/08/04 13:00:00\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n"),{
			header:{
				"先手": "sente",
				"後手": "gote",
				"場所": "将棋会館",
				"開始日時": "2015/08/04 13:00:00",
			},
			initial: initial,
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(7,9),to:p(7,8),piece:"GI"}},
				{move:{from:p(2,2),to:p(8,8),piece:"UM"}},
				{special:"TORYO"},
			]
		});
	});
	it("separator -- csa file can contain multiple kifus");
});
describe("csa-parser V1", function(){
	var initial;
	beforeEach(function(){
		initial = {
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
		};
	});
	it("simple", function(){
		assert.deepEqual(csaParser.parse("\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+8822UM\n\
-3122GI\n\
+0045KA\n"),{
			header:{},
			initial: initial, // normalizerがpresetを復元する
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
				{move:{to:p(4,5),piece:"KA"}},
			]
		});
	});
	it("comment", function(){
		assert.deepEqual(csaParser.parse("\
PI\n\
+\n\
'開始時コメント\n\
+7776FU\n\
'初手コメント\n\
'初手コメント2\n\
-3334FU\n\
+8822UM\n"),{
			header:{},
			initial: initial,
			moves:[
				{comments:["開始時コメント"]},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"},comments:["初手コメント", "初手コメント2"]},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"}},
			]
		});
	});
	it("special", function(){
		assert.deepEqual(csaParser.parse("\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n"),{
			header:{},
			initial: initial,
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(7,9),to:p(7,8),piece:"GI"}},
				{move:{from:p(2,2),to:p(8,8),piece:"UM"}},
				{special:"TORYO"},
			]
		});
	});
	it("comma", function(){
		assert.deepEqual(csaParser.parse("\
PI\n\
+\n\
+7776FU,T12,-3334FU,T2\n\
+8822UM,T100\n\
-3122GI,T1\n\
+0045KA,T0\n"),{
			header:{},
			initial: initial, // normalizerがpresetを復元する
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"},time:{now:{m:0,s:12}}}, // totalはnormalizerが復元
				{move:{from:p(3,3),to:p(3,4),piece:"FU"},time:{now:{m:0,s:2}}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"},time:{now:{m:1,s:40}}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"},time:{now:{m:0,s:1}}},
				{move:{to:p(4,5),piece:"KA"},time:{now:{m:0,s:0}}},
			]
		});
	});
	it("time", function(){
		assert.deepEqual(csaParser.parse("\
PI\n\
+\n\
+7776FU\n\
T12\n\
-3334FU\n\
T2\n\
+8822UM\n\
T100\n\
-3122GI\n\
T1\n\
+0045KA\n\
T0\n"),{
			header:{},
			initial: initial, // normalizerがpresetを復元する
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"},time:{now:{m:0,s:12}}}, // totalはnormalizerが復元
				{move:{from:p(3,3),to:p(3,4),piece:"FU"},time:{now:{m:0,s:2}}},
				{move:{from:p(8,8),to:p(2,2),piece:"UM"},time:{now:{m:1,s:40}}},
				{move:{from:p(3,1),to:p(2,2),piece:"GI"},time:{now:{m:0,s:1}}},
				{move:{to:p(4,5),piece:"KA"},time:{now:{m:0,s:0}}},
			]
		});
	});
	describe("開始局面", function(){
		it("平手初期局面", function(){
			assert.deepEqual(csaParser.parse("\
PI82HI22KA91KY81KE21KE11KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n"),{
				header:{},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
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
				moves:[
					{},
					{move:{from:p(5,1),to:p(4,2),piece:"OU"}},
					{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
					{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
					{move:{from:p(8,8),to:p(6,6),piece:"KA"}},
					{move:{from:p(7,1),to:p(8,2),piece:"GI"}},
				]
			});
		});
		it("一括表現", function(){
			assert.deepEqual(csaParser.parse("\
P1 *  * -GI-KI-OU-KI-GI *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P1 *  *  *  *  *  *  *  *  * \n\
P3+FU+FU+FU+FU+FU+FU+FU+FU+FU\n\
P1 * +KA *  *  *  *  * +HI * \n\
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n\
-\n\
-5142OU\n\
+7776FU\n\
-3122GI\n\
+8866KA\n\
-7182GI\n"),{
				header:{},
				initial: {
					preset: "OTHER",
					data: {
						board: [
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KY" },],
							[{                          }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, { color: true, kind: "HI" }, { color: true, kind: "KE" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "OU" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "OU" },],
							[{ color: false, kind: "KI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "KI" },],
							[{ color: false, kind: "GI" }, {}, { color: false, kind: "FU" }, {}, {}, {}, { color: true, kind: "FU" }, {}, { color: true, kind: "GI" },],
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
				moves:[
					{},
					{move:{from:p(5,1),to:p(4,2),piece:"OU"}},
					{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
					{move:{from:p(3,1),to:p(2,2),piece:"GI"}},
					{move:{from:p(8,8),to:p(6,6),piece:"KA"}},
					{move:{from:p(7,1),to:p(8,2),piece:"GI"}},
				]
			});
		});
		it("駒別単独表現", function(){
			assert.deepEqual(csaParser.parse("\
P-11OU21FU22FU23FU24FU25FU26FU27FU28FU29FU\n\
P+00HI00HI00KY00KY00KY00KY\n\
P-00GI00GI00GI00GI00KE00KE00KE00KE\n\
+\n\
+0013KY\n\
-0012KE\n\
+1312NY\n"),{
				header:	{},
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
					{move:{from:p(1,3),to:p(1,2),piece:"NY"}},
				]
			});
		});
		it("AL", function(){
			assert.deepEqual(csaParser.parse("\
V2.2\n\
P+23FU\n\
P-11OU21KE\n\
P+00KI\n\
P-00AL\n\
+\n\
+0022KI\n\
%TSUMI\n"),{
				header:	{},
				initial: {
					preset:"OTHER",
					data:{
						board:[
							[{color:false,kind:"OU"},{},{},{},{},{},{},{},{}],
							[{color:false,kind:"KE"},{},{color:true,kind:"FU"},{},{},{},{},{},{}],
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
							{FU:0,KY:0,KE:0,GI:0,KI:1,KA:0,HI:0},
							{FU:17,KY:4,KE:3,GI:4,KI:3,KA:2,HI:2},
						]
					}
				},
				moves:[
					{},
					{move:{to:p(2,2),piece:"KI"}},
					{special: "TSUMI"},
				]
			});
		});
	});
	it("header", function(){
		assert.deepEqual(csaParser.parse("\
N+sente\n\
N-gote\n\
PI\n\
+\n\
+7776FU\n\
-3334FU\n\
+7978GI\n\
-2288UM\n\
%TORYO\n"),{
			header:{
				"先手": "sente",
				"後手": "gote",
			},
			initial: initial,
			moves:[
				{},
				{move:{from:p(7,7),to:p(7,6),piece:"FU"}},
				{move:{from:p(3,3),to:p(3,4),piece:"FU"}},
				{move:{from:p(7,9),to:p(7,8),piece:"GI"}},
				{move:{from:p(2,2),to:p(8,8),piece:"UM"}},
				{special:"TORYO"},
			]
		});
	});
});
