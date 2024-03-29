import React from "react";
import { KifuLite } from "kifu-for-js";

export const Example1 = (props) => (
  <KifuLite
    {...props}
    kifu={`
後手の持駒：飛二　金四　桂四　香四　歩十八
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・v銀v玉v銀 ・ ・ ・|一
| ・ ・ ・ ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ 銀 ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ 角|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：銀
*最も有名な古典詰将棋。
*銀で押さえ込むのは難しそうに見えるが？
▲５二角成
*焦点の捨て駒が好手。
△同銀右 ▲６二銀打
*どちらで取っても玉のコビンが空いて詰み。
まで3手で詰み
`}
  />
);

export const Example2 = () => (
  <KifuLite
    kifu={`
V2.2
PI
+
'鬼殺し戦法の成功例をご紹介します。
+7776FU
'まずは角道を開けます。
-3334FU
+8977KE
'この桂跳ねが鬼殺しの要。
-8384FU
+7765KE
-7162GI
+7675FU
'次に☗７四歩を狙います。
'☖同歩には☗２二角成から☗５五角の両取りが決まります。
-6364FU
'斜めの筋を止めつつ桂を取りに来ますが…
+8822UM
-3122GI
+0055KA
'桂取りをかけてきた歩を取ってしまいます。
-6263GI
'この手は疑問で、代わりに☖３三銀などと歩を取らせてからまだひと悶着あります。
+6553NK
'桂を成れて大成功です。６三の銀を助けようとすると２二の銀への効きがなくなり☗２二角成でさらに優位を拡大できそうです。
%CHUDAN
`}
  ></KifuLite>
);
