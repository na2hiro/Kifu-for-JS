{
	function toN(ss){
		return parseInt(ss.join(""), 10);
	}
	function zenToN(s){
		return "０１２３４５６７８９".indexOf(s);
	}
	function kanToN(s){
		return "〇一二三四五六七八九".indexOf(s);
	}
	function kanToN2(s){
		switch(s.length){
			case 1:
				return "〇一二三四五六七八九十".indexOf(s);
			case 2:
				return "〇一二三四五六七八九十".indexOf(s[1])+10;
			default:
				throw "21以上の数値に対応していません";
		}
	}
	function kindToCSA(kind){
		if(kind[0]=="成"){
			return {
				"香": "NY",
				"桂": "NK",
				"銀": "NG"
			}[kind[1]];
		}
		return {
			"歩": "FU",
			"香": "KY",
			"桂": "KE",
			"銀": "GI",
			"金": "KI",
			"角": "KA",
			"飛": "HI",
			"玉": "OU",
			"王": "OU",
			"と": "TO",
			"杏": "NY",
			"圭": "NK",
			"全": "NG",
			"馬": "UM",
			"竜": "RY",
			"龍": "RY"
		}[kind];
	}
	function specialToCSA(str){
		return {
			"中断": "CHUDAN",
			"投了": "TORYO",
			"持将棋": "JISHOGI",
			"千日手": "SENNICHITE",
			"詰み": "TSUMI",
			"切れ負け": "TIME_UP",
			"反則勝ち": "ILLEGAL_ACTION", // 直前の手が反則(先頭に+か-で反則した側の情報を含める必要が有る)
			"反則負け": "ILLEGAL_MOVE" // ここで手番側が反則，反則の内容はコメントで表現
		}[str];
	}
	function presetToString(preset){
		return {
			"平手": "HIRATE", 
			"香落ち": "KY",
			"右香落ち": "KY_R",
			"角落ち": "KA",
			"飛車落ち": "HI",
			"飛香落ち": "HIKY",
			"二枚落ち": "2",
			"三枚落ち": "3",
			"四枚落ち": "4",
			"五枚落ち": "5",
			"左五枚落ち": "5_L",
			"六枚落ち": "6",
			"八枚落ち": "8",
			"十枚落ち": "10",
			"その他": "OTHER",
		}[preset.replace(/\s/g, "")];
	}
	function makeHand(str){
		var kinds = str.replace(/　$/, "").split("　");
		var ret = {};
		for(var i=0; i<kinds.length; i++){
			ret[kindToCSA(kinds[i][0])] = kinds[i].length==1?1:kanToN2(kinds[i].slice(1));
		}
		return ret;
	}
}

kifu
 = skipline* headers:header* ini:initialboard? headers2:header* split? moves:moves forks:fork* nl? {
 	var ret = {header:{}, moves:moves}
	for(var i=0; i<headers.length; i++){
		ret.header[headers[i].k]=headers[i].v;
	}
	for(var i=0; i<headers2.length; i++){
		ret.header[headers2[i].k]=headers2[i].v;
	}
	if(ini){
		ret.initial = ini;
	}else if(ret.header["手合割"]){
		var preset = presetToString(ret.header["手合割"]);
		if(preset!="OTHER") ret.initial={preset: preset};
	}
	if(ret.initial && ret.initial.data){
		if(ret.header["手番"]){
			ret.initial.data.color="下先".indexOf(ret.header["手番"])>=0 ? true : false;
		}else{
			ret.initial.data.color = true;
		}
		ret.initial.data.hands = [{}, {}];
		if(ret.header["先手の持駒"] || ret.header["下手の持駒"]){
			ret.initial.data.hands[0] = makeHand(ret.header["先手の持駒"] || ret.header["下手の持駒"]);
			delete ret.header["先手の持駒"];
			delete ret.header["下手の持駒"];
		}
		if(ret.header["後手の持駒"] || ret.header["上手の持駒"]){
			ret.initial.data.hands[1] = makeHand(ret.header["後手の持駒"] || ret.header["上手の持駒"]);
			delete ret.header["先手の持駒"];
			delete ret.header["下手の持駒"];
		}
	}
	var forkStack = [{te:0, moves:moves}];
	for(var i=0; i<forks.length; i++){
		var nowFork = forks[i];
		var fork = forkStack.pop();
		while(fork.te>nowFork.te){fork = forkStack.pop();}
		var move = fork.moves[nowFork.te-fork.te];
		move.fork = move.fork || [];
		move.fork.push(nowFork.moves);
		forkStack.push(fork);
		forkStack.push(nowFork);
	}
	return ret;
}

// ヘッダ
header
 = key:[^：\r\n]+ "：" value:nonl* nl {return {k:key.join(""), v:value.join("")}} / te:turn "手番" nl {return {k:"手番",v:te}}

turn = [先後上下]

initialboard = (" " nonl* nl)? ("+" nonl* nl)? lines:ikkatsuline+ ("+" nonl* nl)? {
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
ikkatsuline = "|" masu:masu+ "|" nonl+ nl { return masu; }
masu = c:teban k:piece {return {color:c, kind:k}} / " ・" { return {} }
teban = (" "/"+"/"^"){return true} / ("v"/"V"){return false}

split = "手数----指手--" "-------消費時間--"? nl

// 棋譜部分
moves = hd:firstboard tl:move* result? {tl.unshift(hd); return tl;}

firstboard = c:comment* pointer? {return c.length==0 ? {} : {comments:c}}
move = line:line c:comment* pointer? {
	var ret = {time: line.time};
	if(c.length>0) ret.comments = c;
	if(typeof line.move=="object"){
		ret.move=line.move;
	}else{
		ret.special=specialToCSA(line.move)
	}
	return ret;
}

pointer = "&" nonl* nl

line = " "* te " "* move:(fugou:fugou from:from {
	var ret = {from: from, piece: fugou.piece};
	if(fugou.to){ret.to=fugou.to}else{ret.same=true};
	if(fugou.promote) ret.promote=true;
	return ret;
} / spe:[^\r\n ]* {return spe.join("")}) " "* time:time? "+"? nl {return {move: move, time: time}}

te = [0-9]+
fugou = pl:place pi:piece pro:"成"? {return {to:pl, piece: pi,promote:!!pro};}
place = x:num y:numkan {return {x:x,y:y}} / "同　" {return null}

num = n:[１２３４５６７８９] {return zenToN(n);}
numkan = n:[一二三四五六七八九] {return kanToN(n);}

piece = pro:"成"? p:[歩香桂銀金角飛王玉と杏圭全馬竜龍] {return kindToCSA((pro||"")+p);}

from = "打" {return null} / "(" x:[1-9] y:[1-9] ")" {return {x:parseInt(x),y:parseInt(y)}}

time = "(" " "* now:ms "/" total:hms ")" {return {now: now, total: total}}

hms = h:[0-9]+ ":" m:[0-9]+ ":" s:[0-9]+ {return {h:toN(h),m:toN(m),s:toN(s)}}
ms = m:[0-9]+ ":" s:[0-9]+ {return {m:toN(m),s:toN(s)}}

comment = "*" comm:nonl* nl {return comm.join("")}

result = "まで" [0-9]+ "手" res:(
	"で" win:turn "手の勝ち" {return {win:win}}
	/ "で時間切れにより" win:turn "手の勝ち" {return {win:win, result:"時間切れ"}}
	/ "で" win:turn "手の反則勝ち" {return {win:win, result:"反則"}}
	/ "で中断" {return {result: "中断"}}
	/ "で持将棋" {return {result: "持将棋"}}
	/ "で千日手" {return {result:"千日手"}}
	/ "で"? "詰" {return "詰"}
	/ "で不詰" {return "不詰"}
) nl {return res}

fork = "変化：" " "* te:[0-9]+ "手" nl moves:moves {return {te:parseInt(te), moves:moves.slice(1)}}


nl = newline+ skipline*
skipline = ("#" nonl* newline)
newline = "\n" / "\r" "\n"?
nonl = [^\r\n]
