{
	function secToTime(sec){
		var remain, h, m, s = sec%60;
		remain = (sec-s)/60;
		m = remain%60;
		remain = (remain - m)/60;
		return {h:remain, m:m, s:s};
	}
}
kifu = p:players? s:startboard? ms:moves { return {players:p, start:s, moves:ms, type:"csa"} }

players = comment* sen:("N+" n:nonl* nl { return n })? comment* go:("N-" n:nonl* nl { return n})? { return [sen.join(""), go.join("")] }

startboard = comment* board:(hirate / ikkatsu / komabetsu) comment* teban:teban nl {return {board:board, teban: teban}}

hirate = "PI" (xypiece)*

ikkatsu = ikkatsuline+
ikkatsuline = "P" [1-9] masu:masu+ nl { return masu; }
masu = teban piece / " * " { return [] }

komabetsu = komabetsuline*
komabetsuline = "P" teban (xypiece)+ nl

moves = hd:firstboard tl:move* {tl.unshift(hd); return tl;}
firstboard = c:comment* {return {comments:c}}

move = comment:comment* move:(normalmove / specialmove) time:time? { return {comment:comment, move:move, time:time} }
normalmove = teban from:xy to:xy piece:piece nl { return {from:from.x==0?null:from, to:to, piece:piece}}
specialmove = "%" m:[A-Z]+ nl { return {special: m.join("")}; }

teban = "+"/"-"

comment = "'" c:nonl* nl { return c.join(""); }
time = "T" t:[0-9]* nl { return {now: secToTime(parseInt(t.join("")))}; }

xy = x:[0-9] y:[0-9] { return {x:parseInt(x), y:parseInt(y)}; }
piece = a:[A-Z] b:[A-Z] { return a+b; }
xypiece = xy:xy piece:piece {return {xy:xy, piece:piece}}

nl = ("\r"? "\n") / " "* ","
nonl = [^\r\n]
