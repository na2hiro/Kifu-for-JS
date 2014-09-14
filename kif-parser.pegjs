{
	function toN(ss){
		return parseInt(ss.join(""), 10);
	}
	function zenToN(s){
		return s.charCodeAt(0)-65296;
	}
	function kanToN(s){
		return [0, 19968, 20108, 19977, 22235, 20116, 20845, 19971, 20843, 20061].indexOf(s.charCodeAt(0));
	}
}

kifu
 = version headers:headers split? moves:moves res:result? {return {headers:headers, moves:moves,result:res}}

version = "#" nonl* nl / ""

// ヘッダ
headers
 = h:header hs:headers { hs[h.k]=h.v; return hs;}
 / "" {return {}}

header
 = key:[^：]+ "：" value:nonl* nl {return {k:key.join(""), v:value.join("")}}

split = "手数----指手---------消費時間--" nl

// 棋譜部分
moves = hd:firstboard tl:move* {tl.unshift(hd); return tl;}

firstboard = c:comment* {return {comments:c}}
move = line:line c:comment* {return {comments: c, kifu: line}}

line = " "* te " "* move:(fugou:fugou from:from {return {fugou: fugou, from: from}} / "投了") " "* time:time nl {return {move: move, time: time}}

te = [0-9]+
fugou = pl:place pi:piece pro:"成"? {return {place: pl, piece: pi,promote:!!pro}}
place = x:num y:numkan {return {x:x,y:y}} / "同　" {return {same:true}}

num = n:[１２３４５６７８９] {return zenToN(n);}
numkan = n:[一二三四五六七八九] {return kanToN(n);}

piece = pro:"成"? p:[歩香桂銀金角飛玉と馬竜] {return (pro||"")+p}

from = "打" {return {da:true}} / "(" x:[1-9] y:[1-9] ")" {return {x:x,y:y}}

time = "(" " "* now:ms "/" total:hms ")" {return {now: now, total: total}}

hms = h:[0-9]+ ":" m:[0-9]+ ":" s:[0-9]+ {return {h:toN(h),m:toN(m),s:toN(s)}}
ms = m:[0-9]+ ":" s:[0-9]+ {return {m:toN(m),s:toN(s)}}

comment = "*" comm:nonl* nl {return comm.join("")}

result = "まで" [0-9]+ "手で" win:[先後] "手の勝ち" nl {return win[0]}

nl = "\r"? "\n"
nonl = [^\r\n]
