{
	function toN(ss){
		return parseInt(ss.join(""), 10);
	}
	function zenToN(s){
		return s.charCodeAt(0)-65296;
	}
	function kanToN(s){
		// cannot use multibyte characters
		return [0, 19968, 20108, 19977, 22235, 20116, 20845, 19971, 20843, 20061].indexOf(s.charCodeAt(0));
	}
}

kifu
 = headers:headers moves:moves res:result? { return {header:headers, moves:moves, result:res, type:"ki2"} }

// ヘッダ
headers
 = h:header hs:headers { hs[h.k]=h.v; return hs;}
 / "" {return {}}

header
 = key:[^：]+ "：" value:nonl* nl+ { return {k:key.join(""), v:value.join("")}}

moves = hd:firstboard tl:move* {tl.unshift(hd); return tl;}

firstboard = c:comment* {return {comments:c}}
move = line:line c:comment* (nl / " ")* { return {comments:c, move: line } }

line = [▲△] f:fugou (nl / " ")*  {return f}
fugou = pl:place pi:piece sou:soutai? dou:dousa? pro:("成"/"不成")? da:"打"? {
	var ret = {to: pl, piece: pi};
	if(pro)ret.promote=pro.charCodeAt(0)==25104 /* nari */;
	if(sou)ret.soutai=sou; if(dou)ret.dousa=dou; if(da)ret.da=!!da;
	return ret;
}
place = x:num y:numkan {return {x:x,y:y}} / "同" "　"? {return {same:true}}
piece = pro:"成"? p:[歩香桂銀金角飛玉と馬竜] {return (pro||"")+p}
soutai = [左直右]
dousa = [上寄引]

num = n:[１２３４５６７８９] {return zenToN(n);}
numkan = n:[一二三四五六七八九] {return kanToN(n);}

comment = "*" comm:nonl* nl {return comm.join("")}

result = "まで" [0-9]+ "手で" win:[先後] "手の勝ち" nl? {return win[0]}

nl = "\r"? "\n"
nonl = [^\r\n]
