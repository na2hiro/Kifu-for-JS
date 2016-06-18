{
	function secToTime(sec){
		var remain, h, m, s = sec%60;
		m = (sec-s)/60;
		return {m:m, s:s};
	}
	function getHirate(){
		return [
			[{color:1,kind:"KY"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"KY"},],
			[{color:1,kind:"KE"},{color:1,kind:"KA"},{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{color:0,kind:"HI"},{color:0,kind:"KE"},],
			[{color:1,kind:"GI"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"GI"},],
			[{color:1,kind:"KI"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"KI"},],
			[{color:1,kind:"OU"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"OU"},],
			[{color:1,kind:"KI"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"KI"},],
			[{color:1,kind:"GI"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"GI"},],
			[{color:1,kind:"KE"},{color:1,kind:"HI"},{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{color:0,kind:"KA"},{color:0,kind:"KE"},],
			[{color:1,kind:"KY"},{                 },{color:1,kind:"FU"},{},{},{},{color:0,kind:"FU"},{                 },{color:0,kind:"KY"},],
		];
	}
	function normalizeHeaderKey(key){
		return {
			"EVENT": "棋戦",
			"SITE": "場所",
			"START_TIME": "開始日時",
			"END_TIME": "終了日時",
			"TIME_LIMIT": "持ち時間",
		}[key] || key;
	}
}
kifu = csa2 / csa1

csa2 = version20to22 i:information? ini:initialboard ms:moves? {
	var ret = {header:i.header, initial:ini, moves:ms}
	if(i && i.players){
		if(i.players[0]) ret.header["先手"]=i.players[0];
		if(i.players[1]) ret.header["後手"]=i.players[1];
	}
	return ret;
}

version20to22 = comment* "V2" (".1" / ".2")? nl

information = players:players? header:headers {return {players:players, header:header}}

headers = header:header* {
	var ret = {};
	for(var i=0; i<header.length; i++){
		ret[normalizeHeaderKey(header[i].k)]=header[i].v;
	}
	return ret;
}
header = comment* "$" k:[^:]+ ":" v:nonl* nl {return {k:k.join(""), v:v.join("")}}

csa1 = p:players? ini:initialboard? ms:moves {
	var ret = {header: {}, initial:ini, moves:ms}
	if(p){
		if(p[0]) ret.header["先手"] = p[0];
		if(p[1]) ret.header["後手"] = p[1];
	}
	return ret;
}

players = comment* sen:("N+" n:nonl* nl { return n })? comment* go:("N-" n:nonl* nl { return n})? { return [sen?sen.join(""):null, go?go.join(""):null] }

initialboard = comment* data:(hirate / ikkatsu / ""{return "NO"}) koma:komabetsu comment* teban:teban nl {
	if(data=="NO"){
		data = koma;
	}else{
		data.data.hands = koma.data.hands;
	}
	data.data.color=teban;
	return data;
}

hirate = "PI" ps:(xypiece)* nl{
//	if(ps.length==0) return {preset: "HIRATE"};
	var ret = {preset: "OTHER", data: {board: getHirate()}};
	for(var i=0; i<ps.length; i++){
		ret.data.board[ps[i].xy.x-1][ps[i].xy.y-1]={};
	}
	return ret;
}

ikkatsu = lines:ikkatsuline+ {
	var ret = [];
	for(var i=0; i<9; i++){
		var line = [];
		for(var j=0; j<9; j++){
			line.push(lines[j][8-i]);
		}
		ret.push(line);
	}
	return {preset: "OTHER", data: {board:ret}};
}
ikkatsuline = "P" [1-9] masu:masu+ nl { return masu; }
masu = c:teban k:piece {return {color:c, kind:k}} / " * " { return {} }

komabetsu = lines:komabetsuline* {
	var board=[];
	var hands=[
		{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0},
		{FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0}
	];
	var all = {FU:18,KY:4,KE:4,GI:4,KI:4,KA:2,HI:2};
	for(var i=0; i<9; i++){
		var line=[];
		for(var j=0; j<9; j++){
			line.push({});
		}
		board.push(line);
	}
	all: for(var i=0; i<lines.length; i++){
		for(var j=0; j<lines[i].pieces.length; j++){
			var p = lines[i].pieces[j];
			if(p.xy.x==0){
				// 持ち駒
				if(p.piece=="AL"){
					hands[lines[i].teban]=all;
					break all;
				}
				var obj=hands[lines[i].teban];
				obj[p.piece]++;
			}else{
				// 盤上
				board[p.xy.x-1][p.xy.y-1] = {color: lines[i].teban, kind: p.piece};
			}
			if(p.piece!="OU") all[p.piece]--;
		}
	}
	return {preset: "OTHER", data: {board: board, hands: hands}}
}
komabetsuline = "P" teban:teban pieces:(xypiece)+ nl {return {teban: teban, pieces: pieces}}

moves = hd:firstboard tl:move* comment* {tl.unshift(hd); return tl;}
firstboard = c:comment* {return c.length>0?{comments:c}:{}}

move = move:(normalmove / specialmove) time:time? comments:comment* {
	var ret = {};
	if(comments.length>0){ret.comments=comments;}
	if(time){ret.time=time;}
	if(move.special){ret.special=move.special}else{ret.move=move};
	return ret;
}
normalmove = teban from:xy to:xy piece:piece nl {
	var ret = {to:to, piece:piece}
	if(from.x!=0) ret.from = from;
	return ret;
}
specialmove = "%" m:[-+_A-Z]+ nl { return {special: m.join("")}; }

teban = "+"{return 0}/"-"{return 1}

comment = "'" c:nonl* nl { return c.join(""); }
time = "T" t:[0-9]* nl { return {now: secToTime(parseInt(t.join("")))}; }

xy = x:[0-9] y:[0-9] { return {x:parseInt(x), y:parseInt(y)}; }
piece = a:[A-Z] b:[A-Z] { return a+b; }
xypiece = xy:xy piece:piece {return {xy:xy, piece:piece}}

nl = ("\r"? "\n") / " "* ","
nonl = [^\r\n]
