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
}

kifu
 = skipline* headers:headers split? moves:moves res:result? nl? {
 	var ret = {header:headers, moves:moves,result:res}
	if(ret.header["手合割"]) ret.initial={preset: presetToString(ret.header["手合割"])};
	return ret;
}

// ヘッダ
headers = header:header* {
	var ret = {};
	for(var i=0; i<header.length; i++){
		ret[header[i].k]=header[i].v;
	}
	return ret;
}

header
 = key:[^：\r\n]+ "：" value:nonl* nl {return {k:key.join(""), v:value.join("")}}

split = "手数----指手--" "-------消費時間--"? nl

// 棋譜部分
moves = hd:firstboard tl:move* {tl.unshift(hd); return tl;}

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

line = " "* te " "* move:(fugou:fugou from:from {var ret = {from: from, piece: fugou.piece}; if(fugou.to){ret.to=fugou.to}else{ret.same=true};if(fugou.promote)ret.promote=true; return ret;} / spe:[^\r\n ]* {return spe.join("")}) " "* time:time? nl {return {move: move, time: time}}

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

result = "まで" [0-9]+ "手で" res:(win:[先後上下] "手の勝ち" {return win} / "中断" {return "中断"}) nl {return res}


nl = newline+ skipline*
skipline = ("#" nonl* newline)
newline = "\n" / "\r" "\n"?
nonl = [^\r\n]
