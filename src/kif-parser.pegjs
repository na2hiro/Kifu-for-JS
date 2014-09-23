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
			"と": "TO",
			"馬": "UM",
			"龍": "RY"
		}[kind];
	}
	function specialToCSA(str){
		return {
			"投了": "TORYO"
		}[str];
	}
}

kifu
 = version headers:headers split? moves:moves res:result? {return {header:headers, moves:moves,result:res, type:"kif"}}

version = "#" nonl* nl / ""

// ヘッダ
headers
 = h:header hs:headers { hs[h.k]=h.v; return hs;}
 / "" {return {}}

header
 = key:[^：\r\n]+ "：" value:nonl* nl {return {k:key.join(""), v:value.join("")}}

split = "手数----指手--" "-------消費時間--"? nl

// 棋譜部分
moves = hd:firstboard tl:move* {tl.unshift(hd); return tl;}

firstboard = c:comment* {return {comments:c}}
move = pointer? line:line c:comment* {var ret = {comments: c, time: line.time}; if(typeof line.move=="object"){ret.move=line.move;}else{ret.special=specialToCSA(line.move)} return ret;}

pointer = "&" nonl* nl

line = " "* te " "* move:(fugou:fugou from:from {var ret = {from: from, piece: fugou.piece}; if(fugou.to){ret.to=fugou.to}else{ret.same=true};if(fugou.promote)ret.promote=true; return ret;} / "投了") " "* time:time? nl {return {move: move, time: time}}

te = [0-9]+
fugou = pl:place pi:piece pro:"成"? {return {to:pl, piece: pi,promote:!!pro};}
place = x:num y:numkan {return {x:x,y:y}} / "同　" {return null}

num = n:[１２３４５６７８９] {return zenToN(n);}
numkan = n:[一二三四五六七八九] {return kanToN(n);}

piece = pro:"成"? p:[歩香桂銀金角飛玉と馬龍] {return kindToCSA((pro||"")+p);}

from = "打" {return null} / "(" x:[1-9] y:[1-9] ")" {return {x:parseInt(x),y:parseInt(y)}}

time = "(" " "* now:ms "/" total:hms ")" {return {now: now, total: total}}

hms = h:[0-9]+ ":" m:[0-9]+ ":" s:[0-9]+ {return {h:toN(h),m:toN(m),s:toN(s)}}
ms = m:[0-9]+ ":" s:[0-9]+ {return {m:toN(m),s:toN(s)}}

comment = "*" comm:nonl* nl {return comm.join("")}

result = "まで" [0-9]+ "手で" win:[先後] "手の勝ち" nl {return win[0]}

nl = "\r"? "\n"
nonl = [^\r\n]
