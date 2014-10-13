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
			"寄": "C",
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
			"五枚落ち": "5	",
			"左五枚落ち": "5_L",
			"六枚落ち": "6",
			"八枚落ち": "8",
			"十枚落ち": "10",
			"その他": "OTHER",
		}[preset.replace(/\s/g, "")];
	}
}

kifu
 = headers:headers moves:moves res:result? {
 	var ret = {header:headers, moves:moves, result:res};
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
 = key:[^：\r\n]+ "：" value:nonl* nl+ { return {k:key.join(""), v:value.join("")}}

moves = hd:firstboard tl:move* {tl.unshift(hd); return tl;}

firstboard = c:comment* pointer? {return c.length==0 ? {} : {comments:c}}
move = line:line c:comment* pointer? (nl / " ")* {
	var ret = {move: line};
	if(c.length>0) ret.comments=cl;
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

result = "まで" [0-9]+ "手で" res:(win:[先後] "手の勝ち" {return win} / "中断" {return "中断"}) nl {return res}

nl = "\r"? "\n"
nonl = [^\r\n]
