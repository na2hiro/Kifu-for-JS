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
	function soutaiToRelative(str){
		return {
			"左": "L",
			"直": "C",
			"右": "R",
		}[str] || "";
	}
	function dousaToRelative(str){
		return {
			"上": "U",
			"寄": "M",
			"引": "D",
		}[str] || "";
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
		var ret = {FU:0,KY:0,KE:0,GI:0,KI:0,KA:0,HI:0};
		if(str=="") return ret;
		for(var i=0; i<kinds.length; i++){
			ret[kindToCSA(kinds[i][0])] = kinds[i].length==1?1:kanToN2(kinds[i].slice(1));
		}
		return ret;
	}
}

kifu
 = headers:header* ini:initialboard? headers2:header* moves:moves forks:fork*{
 	var ret = {header:{}, moves:moves};
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
			ret.initial.data.color="下先".indexOf(ret.header["手番"])>=0 ? 0 : 1;
			delete ret.header["手番"];
		}else{
			ret.initial.data.color = 0;
		}
		ret.initial.data.hands = [
			makeHand(ret.header["先手の持駒"] || ret.header["下手の持駒"]),
			makeHand(ret.header["後手の持駒"] || ret.header["上手の持駒"])
		];
		delete ret.header["先手の持駒"];
		delete ret.header["下手の持駒"];
		delete ret.header["後手の持駒"];
		delete ret.header["上手の持駒"];
	}
	var forkStack = [{te:0, moves:moves}];
	for(var i=0; i<forks.length; i++){
		var nowFork = forks[i];
		var fork = forkStack.pop();
		while(fork.te>nowFork.te){fork = forkStack.pop();}
		var move = fork.moves[nowFork.te-fork.te];
		move.forks = move.forks || [];
		move.forks.push(nowFork.moves);
		forkStack.push(fork);
		forkStack.push(nowFork);
	}
	return ret;
}

header
 = key:[^：\r\n]+ "：" value:nonl* nl+ {return {k:key.join(""), v:value.join("")}} / te:[先後上下] "手番" nl {return {k:"手番",v:te}}
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
teban = (" "/"+"/"^"){return 0} / ("v"/"V"){return 1}

moves = hd:firstboard tl:move* res:result? {
	tl.unshift(hd);
	if(res && !tl[tl.length-1].special){
		tl.push({special: res});
	}
	return tl;
}

firstboard = c:comment* pointer? {return c.length==0 ? {} : {comments:c}}
move = line:line c:comment* pointer? (nl / " ")* {
	var ret = {move: line};
	if(c.length>0) ret.comments=c;
	return ret;
}

pointer = "&" nonl* nl

line = [▲△] f:fugou (nl / " ")*  {return f}
fugou = pl:place pi:piece sou:soutai? dou:dousa? pro:("成"/"不成")? da:"打"? {
	var ret = {piece: pi};
	if(pl.same){
		ret.same = true;
	}else{
		ret.to = pl;
	}
	if(pro)ret.promote=pro=="成";
	if(da){
		ret.relative = "H";
	}else{
		var rel = soutaiToRelative(sou)+dousaToRelative(dou);
		if(rel!="") ret.relative=rel;
	}
	return ret;
}
place = x:num y:numkan {return {x:x,y:y}} / "同" "　"? {return {same:true}}
piece = pro:"成"? p:[歩香桂銀金角飛王玉と杏圭全馬竜龍] {return kindToCSA((pro||"")+p)}
soutai = [左直右]
dousa = [上寄引]

num = n:[１２３４５６７８９] {return zenToN(n);}
numkan = n:[一二三四五六七八九] {return kanToN(n);}

comment = "*" comm:nonl* nl {return comm.join("")}

result = "まで" [0-9]+ "手" res:(
	"で" win:turn "手の" res:("勝ち" {return "TORYO"}
		/ "反則" res:("勝ち" {return "ILLEGAL_ACTION"}
			/ "負け" {return "ILLEGAL_MOVE"}) {return res}) {return res}
	/ "で時間切れにより" win:turn "手の勝ち" {return "TIME_UP"}
	/ "で中断" {return "CHUDAN"}
	/ "で持将棋" {return "JISHOGI"}
	/ "で千日手" {return "SENNICHITE"}
	/ "で"? "詰" "み"? {return "TSUMI"}
	/ "で不詰" {return "FUZUMI"}
) nl {return res}

fork = "変化：" " "* te:[0-9]+ "手" nl moves:moves {return {te:parseInt(te.join("")), moves:moves.slice(1)}}

turn = [先後上下]
nl = newline+ skipline*
skipline = ("#" nonl* newline)
whitespace = " " / "\t"
newline = whitespace* ("\n" / "\r" "\n"?)
nonl = [^\r\n]
