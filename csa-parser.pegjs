kifu = p:players? s:startboard? ms:move* {return {players:p, start:s, moves:ms}}

players = comment* sen:("N+" n:nonl* nl { return n })? comment* go:("N-" n:nonl* nl { return n})? { return [sen.join(""), go.join("")] }

startboard = comment* board:(hirate / ikkatsu / komabetsu) comment* teban:teban nl {return {board:board, teban: teban}}

hirate = "PI" (xy piece)*

ikkatsu = ikkatsuline+
ikkatsuline = "P" [1-9] masu:masu+ nl { return masu; }

komabetsu = komabetsuline*
komabetsuline = "P" teban (xy piece)+ nl

masu = teban piece / " * " { return [] }

move = comment* (normalmove / specialmove) time?
normalmove = teban from:xy to:xy piece:piece nl {console.log(from, to);}
specialmove = "%" m:[A-Z]+ nl { return m.join(""); }

teban = "+"/"-"

comment = "'" c:nonl* nl { console.log(c.join("")); return c.join(""); }
time = "T" t:[0-9]* nl { return parseInt(t.join("")); }

xy = a:[0-9] b:[0-9] { return a+b; }
piece = a:[A-Z] b:[A-Z] { return a+b; }

nl = "\r"? "\n"
nonl = [^\r\n]
