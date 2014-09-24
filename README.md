# Kifu for JS
JavaScriptで動く棋譜再生盤とそのブックマークレット
## 概要
* Kifu for JSは，Kifu for FlashやJava同様，HTML内で棋譜を読み込み表示，再生を行う．
	* KIF形式に対応．KI2, CSA, [JKF](https://github.com/na2hiro/json-kifu-format)形式はもうすぐ対応
* Kifu for JSブックマークレットは，1クリックでKifu for FlashやKifu for JavaをKifu for JSに置き換えて盤面を表示する．	
* Flash, Javaなどを必要としないため，iOSやAndroidでも表示できる

## Kifu for JS ブックマークレット
### 使い方
ブックマークレット本体は`src/bookmarklet.min.js`にあり

1. 次のコードをブックマークへ追加する→
`javascript:!function(){var s=document.createElement("script");s.src="https://na2hiro.github.io/Kifu-for-JS/src/public-bookmarklet.min.js",document.body.appendChild(s)}();void 0;`
2. Kifu for FlashやKifu for Javaが使われているページを開く
![](https://na2hiro.github.io/Kifu-for-JS/readme-ss/1.png)
3. ブックマークレットを開く
![](https://na2hiro.github.io/Kifu-for-JS/readme-ss/2.png)
4. FlashやJava部分が置き換えられ，Kifu for JSの再生盤になる
![](https://na2hiro.github.io/Kifu-for-JS/readme-ss/3.png)

## Kifu for JS
### 使い方
`test/loadKif.html`に例

ヘッダ中に次のコードを挿入する．ImageDirectoryPathには駒画像ファイルのあるディレクトリを指定する．

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<link rel="stylesheet" type="text/css" href="../css/kifuforjs.css">
<script src="../src/kifuforjs.js" charset="utf-8"></script>
<script>Kifu.settings={ImageDirectoryPath: "../images"};</script>
```

Kifu.load関数にkifファイルのアドレスを渡して呼び出すと，この場所に盤面を表示する．

```html
<script>Kifu.load("../json-kifu-format/jt201409130101.kif");</script>
```

第二引数にidを渡すと，このコードがある場所ではなく，そのidを持つ要素の子の位置に盤面を挿入する．この方法の場合，ひと通り読み込みが済んでから挿入されるため，head内などにあってもよい．

```html
<script>Kifu.load("../json-kifu-format/jt201409130101.kif", "board");</script>
```

## 動作確認
以下は確認済み．

* Mac Chrome 37
* Mac Firefox 32
* Mac Safari
* Android Chrome 37
* Android Habit 1.1
* iOS 8 Safari

以下はバグを確認．お待ちください．

* Android Firefox 32

以下は手元に確認環境がありません．情報を[@na2hiro](https://twitter.com)までお待ちしています．

* Internet Explorer

## TODO
* より多くの環境で動作確認
* 自動更新
* 分岐への対応(JKF側)
* 左右などの相対情報の付加(JKF側)
* 文字コード切り替え

## license
[Shogi images by muchonovski](http://mucho.girly.jp/bona/) below `images` directory are under a [Creative Commons 表示-非営利 2.1 日本 License](http://creativecommons.org/licenses/by-nc/2.1/jp/).

Other files are released under MIT license. See LICENSE.txt.
