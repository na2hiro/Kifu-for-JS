{
	function secToTime(sec){
		var remain, h, m, s = sec%60;
		remain = (sec-s)/60;
		m = remain%60;
		remain = (remain - m)/60;
		return {h:remain, m:m, s:s};
	}
	function getHirate(){
		return [
			[{color:false,kind:"KY"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KY"},],
			[{color:false,kind:"KE"},{color:false,kind:"KA"},{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{color:true,kind:"HI"},{color:true,kind:"KE"},],
			[{color:false,kind:"GI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"GI"},],
			[{color:false,kind:"KI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KI"},],
			[{color:false,kind:"OU"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"OU"},],
			[{color:false,kind:"KI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KI"},],
			[{color:false,kind:"GI"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"GI"},],
			[{color:false,kind:"KE"},{color:false,kind:"HI"},{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{color:true,kind:"KA"},{color:true,kind:"KE"},],
			[{color:false,kind:"KY"},{                     },{color:false,kind:"FU"},{},{},{},{color:true,kind:"FU"},{                    },{color:true,kind:"KY"},],
		];
	}
}
kifu = csa2 / csa1

csa2 = version22 i:information? ini:initialboard ms:moves? {
	var ret = {header:i.header, initial:ini, moves:ms}
	if(i && i.players){
		if(i.players[0]) ret.header["先手"]=i.players[0];
		if(i.players[1]) ret.header["後手"]=i.players[1];
	}
	return ret;
}

version22 = comment* "V2.2" nl

information = players:players? header:headers {return {players:players, header:header}}

headers = header:header* {
	var ret = {};
	for(var i=0; i<header.length; i++){
		ret[header[i].k]=header[i].v;
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
	var hands=[{}, {}];
	for(var i=0; i<9; i++){
		var line=[];
		for(var j=0; j<9; j++){
			line.push({});
		}
		board.push(line);
	}
	for(var i=0; i<lines.length; i++){
		for(var j=0; j<lines[i].pieces.length; j++){
			var p = lines[i].pieces[j];
			if(p.xy.x==0){
				// 持ち駒
				var obj=hands[lines[i].teban?0:1];
				if(!obj[p.piece]) obj[p.piece]=0;
				obj[p.piece]++;
			}else{
				// 盤上
				board[p.xy.x-1][p.xy.y-1] = {color: lines[i].teban, kind: p.piece};
			}
		}
	}
	return {preset: "OTHER", data: {board: board, hands: hands}}
}
komabetsuline = "P" teban:teban pieces:(xypiece)+ nl {return {teban: teban, pieces: pieces}}

moves = hd:firstboard tl:move* comment* {tl.unshift(hd); return tl;}
firstboard = c:comment* {return {comments:c}}

move = move:(normalmove / specialmove) time:time? comment:comment* { var ret = {comments:comment}; if(time){ret.time=time;}if(move.special){ret.special=move.special}else{ret.move=move}; return ret; }
normalmove = teban from:xy to:xy piece:piece nl { return {from:from.x==0?null:from, to:to, piece:piece}}
specialmove = "%" m:[-+_A-Z]+ nl { return {special: m.join("")}; }

teban = "+"{return true}/"-"{return false}

comment = "'" c:nonl* nl { return c.join(""); }
time = "T" t:[0-9]* nl { return {now: secToTime(parseInt(t.join("")))}; }

xy = x:[0-9] y:[0-9] { return {x:parseInt(x), y:parseInt(y)}; }
piece = a:[A-Z] b:[A-Z] { return a+b; }
xypiece = xy:xy piece:piece {return {xy:xy, piece:piece}}

nl = ("\r"? "\n") / " "* ","
nonl = [^\r\n]
