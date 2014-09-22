# Kifu for JS
JavaScriptで動く棋譜再生盤
## 概要
* KIF, KI2, CSA, [JKF](https://github.com/na2hiro/json-kifu-format)形式の棋譜を読み込んで表示，再生を行う
	* KIFへの対応はまだ不完全
	* KI2, CSA, JKFはもうすぐ対応
* Flash, Javaなどを必要としないため，iOSやAndroidでも表示できる
* ブックマークレットになっており，1クリックでKifu for FlashやKifu for JavaをKifu for JSに置き換え可能

## Kifu for JS
### 使い方
`test/loadKif.html`に例

ヘッダ中に次のコードを挿入する．ImageDirectoryPathには駒画像ファイルのあるディレクトリを指定する．

```
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<link rel="stylesheet" type="text/css" href="../css/kifuforjs.css">
<script src="../src/kifuforjs.js" charset="utf-8"></script>
<script>Kifu.settings={ImageDirectoryPath: "../images"};</script>
```

Kifu.load関数にkifファイルのアドレスを渡して呼び出すと，この場所に盤面を表示する．
```
<script>Kifu.load("../json-kifu-format/jt201409130101.kif");</script>
```

第二引数にidを渡すと，このコードがある場所ではなく，そのidを持つ要素の子の位置に盤面を挿入する．この方法の場合，ひと通り読み込みが済んでから挿入されるため，head内などにあってもよい．
```
<script>Kifu.load("../json-kifu-format/jt201409130101.kif", "board");</script>
```

## Kifu for JS ブックマークレット
### 使い方
ブックマークレット本体は`src/bookmarklet.min.js`にあり

1. [Kifu for JS](javascript:hogehoge) ←これをブックマークへ追加する
2. Kifu for FlashやKifu for Javaが使われているページを開く
3. ブックマークをクリックする
4. FlashやJava部分が置き換えられ，Kifu for JSの再生盤になる