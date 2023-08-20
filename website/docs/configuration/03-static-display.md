# 図面モード

再生盤ではなく、動かすことのできない静的な局面画像を表示することができます。棋譜解説などの際、一つずつ画像を生成する手間を省けます。

TODO: 画像

```html
<script type="text/kifu" data-static>
</script>
```

この場合、操作ボタンやコメント領域が省かれ、縦横比5:6 (250:300)で表示されます。

## 棋譜中の局面を指定して表示

[局面の指定](./specifying-board)も行うことで、棋譜中の一局面を表示することができます。

TODO: 画像

```html
<script type="text/kifu" data-static data-ply="12">
▲７六歩　△３四歩…
</script>
```

TODO: 画像

```html
<script type="text/kifu" data-ply="12" data-forkpointers="[[5, 1], [11, 0]]">
▲７六歩　△３四歩…
</script>
```

## 局面を読み込む

棋譜中の一局面ではなく、局面形式も同様に読み込むことができます。

TODO: 画像

```html
<script type="text/kifu" data-static>
後手の持駒：飛　金三　銀三　桂二　香四　歩十三
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ 馬 ・ ・v桂 ・|一
| ・ ・ ・ ・ ・ ・ ・v玉 ・|二
| ・ ・ ・ ・ ・ ・v歩v歩 ・|三
| ・ ・ ・ ・ ・ ・ ・v金v歩|四
| ・ ・ ・ ・ 歩 ・ ・ ・ 歩|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：飛　角　銀　桂
先手：
後手：
</script>
```

対応形式は次のとおりです。

* BOD形式 (例：上記)
* SFEN形式 (例：`ln1gkg1nl/6+P2/2sppps1p/2p3p2/p8/P1P1P3P/2NP1PP2/3s1KSR1/L1+b2G1NL w R2Pbgp 42`)

## 着手表示の指定

デフォルトでは、初期局面や局面読み込みなどの場合を除き、最終手が着手表示され太字になります。これらを指定したり、また取り除いたりすることができます。

着手表示を抑制する場合

```html
<script type="text/kifu" data-static data-static-last="hidden" data-ply="12">
  ▲７六歩　△３四歩…
</script>
```
着手表示箇所を指定する場合
```html
<script type="text/kifu" data-static data-static-last="[3, 5]">
ln1gkg1nl/6+P2/2sppps1p/2p3p2/p8/P1P1P3P/2NP1PP2/3s1KSR1/L1+b2G1NL w R2Pbgp 42
</script>
```
