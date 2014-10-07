{
	function secToTime(sec){
		var remain, h, m, s = sec%60;
		remain = (sec-s)/60;
		m = remain%60;
		remain = (remain - m)/60;
		return {h:remain, m:m, s:s};
	}
}
kifu = csa2 / csa1

csa2 = version22 i:information? s:startboard ms:moves? {return {headers:i.headers, players: i.players, start:s, moves:ms}}

version22 = comment* "V2.2" nl

information = players:players? headers:headers {return {players:players, headers:headers}}

headers = header:header* {var ret = {}; for(var i=0; i<header.length; i++){ret[header[i].k]=header[i].v}; return ret;}
header = comment* "$" k:[^:]+ ":" v:nonl* nl {return {k:k.join(""), v:v.join("")}}

csa1 = p:players? s:startboard? ms:moves { return {players:p, start:s, moves:ms} }

players = comment* sen:("N+" n:nonl* nl { return n })? comment* go:("N-" n:nonl* nl { return n})? { return [sen?sen.join(""):null, go?go.join(""):null] }

startboard = comment* board:(hirate / ikkatsu / komabetsu) comment* teban:teban nl {return {board:board, teban: teban}}

hirate = "PI" (xypiece)*

ikkatsu = ikkatsuline+
ikkatsuline = "P" [1-9] masu:masu+ nl { return masu; }
masu = teban piece / " * " { return [] }

komabetsu = komabetsuline*
komabetsuline = "P" teban (xypiece)+ nl

moves = hd:firstboard tl:move* comment* {tl.unshift(hd); return tl;}
firstboard = c:comment* {return {comments:c}}

move = comment:comment* move:(normalmove / specialmove) time:time? { var ret = {comments:comment}; if(time){ret.time=time;}if(move.special){ret.special=move.special}else{ret.move=move}; return ret; }
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
