# Kifu for JS (ver. 1.0.9)
JavaScriptで動く棋譜再生盤とそのブックマークレット

## 概要
* Kifu for JSは，Kifu for FlashやJava同様，HTML内で棋譜を読み込み表示，再生を行う．
	* **KIF**, **KI2**, **CSA**, [**JKF**](https://github.com/na2hiro/json-kifu-format)形式に対応．
* Kifu for JSブックマークレットは，1クリックでKifu for FlashやKifu for JavaをKifu for JSに置き換えて盤面を表示する．	
* Flash, Javaなどを必要としないため，iOSやAndroidでも表示できる

## 動作例
[**こちら**](http://na2hiro.github.io/Kifu-for-JS/test/example.html)

## Kifu for JS ブックマークレット
1クリックでKifu for {Flash/Java}をKifu for JSに置き換えて盤面を表示します．

### 使い方

1. 次のコードをブックマークへ追加する→
`javascript:!function(){var s=document.createElement("script");s.src="https://na2hiro.github.io/Kifu-for-JS/src/public-bookmarklet.min.js",document.body.appendChild(s)}();void 0;`
2. Kifu for FlashやKifu for Javaが使われているページを開く
![](https://na2hiro.github.io/Kifu-for-JS/readme-ss/1.png)
3. ブックマークレットを開く
![](https://na2hiro.github.io/Kifu-for-JS/readme-ss/2.png)
4. FlashやJava部分が置き換えられ，Kifu for JSの再生盤になる
![](https://na2hiro.github.io/Kifu-for-JS/readme-ss/3.png)

## Kifu for JS
### 機能
既にKifu for Flashとほぼ同等以上の機能を備えています．

* 対応棋譜形式: **kif**, **ki2**, kifu, ki2u, **csa**, jkf
* 駒落ちや詰将棋等の初期局面指定にも対応
* 変化手順の再生が可能
* 棋譜中継のための自動更新機能
* 棋譜クリックやキーボードでの再生
* 棋譜入力機能
	* 再生中に本譜以外の手を進めることができる
	* 進めた手は変化手順(分岐)として格納
* 棋譜読み込み機能
	* 棋譜ファイルをドラッグ&ドロップで読み込み

### 設置方法
右の"Download ZIP"よりダウンロード

jQuery(2.1以降で動作確認), kifuforjs.js, kifuforjs.cssを読み込む．
ImageDirectoryPathには駒画像ファイルのあるディレクトリを指定する．(`test/loadKif.html`にコード例)

(ver. 1.0.8よりkifuforjs.jsの所在がsrcからoutへ変更されました)

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<link rel="stylesheet" type="text/css" href="../css/kifuforjs.css">
<script src="../out/kifuforjs.js" charset="utf-8"></script>
<script>Kifu.settings={ImageDirectoryPath: "../images"};</script>
```

Kifu.load関数にkifファイルのアドレスを渡して呼び出すと，この場所に盤面を表示する．

```html
<script>Kifu.load("../json-kifu-format/jt201409130101.kif");</script>
```

第二引数にidを渡すと，このコードがある場所ではなく，そのidを持つ要素の子の位置に盤面を挿入する．この方法の場合，ひと通り読み込みが済んでから挿入されるため，scriptはhead内などにあってもよい．

```html
<script>Kifu.load("../json-kifu-format/jt201409130101.kif", "board");</script>
〜
<div id="board"></div>
```

## 動作環境
以下は確認済み．

* Mac Chrome 37
* Mac Firefox 32
* Mac Safari 8
* Windows Internet Explorer 11
* Android Chrome 37
* Android Firefox 32
* Android Habit 1.1
* iOS 8 Safari

以下は手元に確認環境がありません．情報を[@na2hiro](https://twitter.com/na2hiro)までお待ちしています．

* Internet Explorer 10以下

## お願い

* 棋譜形式の対応には注意を払っていますが，もし動作しない棋譜がありましたら対応しますので，Twitterやissuesでご報告いただければ幸いです．
* 要望やバグ報告は[issues](https://github.com/na2hiro/Kifu-for-JS/issues)へよろしくお願いします．
* 棋譜形式そのものについては[JSON棋譜フォーマット](https://github.com/na2hiro/json-kifu-format)もご参照ください．

## 開発環境

* JSX 0.12.2 ([react-tools](http://facebook.github.io/react/docs/getting-started.html#offline-transform))

## license
[Shogi images by muchonovski](http://mucho.girly.jp/bona/) below `images` directory are under a [Creative Commons 表示-非営利 2.1 日本 License](http://creativecommons.org/licenses/by-nc/2.1/jp/).

Other files are released under MIT license. See LICENSE.txt.
