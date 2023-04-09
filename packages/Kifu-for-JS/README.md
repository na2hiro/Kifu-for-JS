# Kifu for JS ![Build Status](https://github.com/na2hiro/Kifu-for-JS/actions/workflows/main.yml/badge.svg) [![GitHub pages status](https://github.com/na2hiro/Kifu-for-JS/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/na2hiro/Kifu-for-JS/actions/workflows/gh-pages.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/kifu-for-js.svg)](https://badge.fury.io/js/kifu-for-js)
モバイルで使いやすい(ことを目指す)将棋の棋譜再生盤とそのブックマークレット

## Kifu for JS 将棋再生盤
Kifu for JSは，Kifu for Flash同様，Webページ内で棋譜を読み込み表示，再生を行います．

<img src="http://na2hiro.github.io/Kifu-for-JS/readme-ss/k4j-main.jpg" width="744">

[**Demoはこちら**](http://na2hiro.github.io/Kifu-for-JS/examples/example.html)

### 機能
既にKifu for Flashと同等程度の機能を備えています．

* 対応棋譜形式: **kif**, **ki2**, kifu, ki2u, **csa**, [**jkf**](../json-kifu-format#readme)
* 駒落ちや詰将棋等の初期局面指定にも対応
* 変化手順の再生が可能
* 棋譜中継のための自動更新機能
* 棋譜クリックや矢印キーでの再生
* 棋譜入力機能
	* 再生中に本譜以外の手を進めることができる
	* 進めた手は変化手順(分岐)として格納
* 棋譜読み込み機能
	* 棋譜ファイルをドラッグ&ドロップで読み込み

### 設置方法
1. Kifu for JSファイルをページに読み込みます。（jsDelivrの提供するCDNを利用しています）

```html
<script src="https://cdn.jsdelivr.net/npm/kifu-for-js@3/bundle/kifu-for-js.min.js" charset="utf-8"></script>
```

`@3`の部分では、`3.*.*`の最新を読み込むという指定で、機能追加・バグ修正更新が自動で反映されます。
[Semantic Versioning](https://semver.org/) を採用しているため、後方互換性のない変更がある場合は`4.*.*`台にするつもりですが、不安がある場合は`@3.0.0`にするなどバージョンを固定して下さい。

2. `KifuForJS.load` (v1では`Kifu.load`)関数にkifファイルのアドレスを渡して呼び出すと，この場所に盤面を表示する．

```html
<script>KifuForJS.load("../json-kifu-format/jt201409130101.kif");</script>
```

第二引数にidを渡すと，このコードがある場所ではなく，そのidを持つ要素の子の位置に盤面を挿入する．この方法の場合，ひと通り読み込みが済んでから挿入されるため，scriptはhead内などにあってもよい．

```html
<script>KifuForJS.load("../json-kifu-format/jt201409130101.kif", "board");</script>
〜
<div id="board"></div>
```

これ以外の使用例は [**Demo**](http://na2hiro.github.io/Kifu-for-JS/examples/example.html) をご覧ください。

## Kifu for JS ブックマークレット

Kifu for JSブックマークレットは，古いKifu for {Flash/Java}が設置されているページで実行すると、Kifu for JSに置き換えて盤面を表示します．

### 使い方

1. あらかじめ次のコードをブックマークへ追加しておく
```javascript
javascript:!function(){var s=document.createElement("script");s.src="https://na2hiro.github.io/Kifu-for-JS/src/public-bookmarklet.min.js",document.body.appendChild(s)}();void 0;
```
2. Kifu for FlashやKifu for Javaが使われている古いページ ([例](https://web.archive.org/web/20191105055709/http://live.shogi.or.jp/oui/kifu/55/oui201409100101.html)) を開く

<img src="http://na2hiro.github.io/Kifu-for-JS/readme-ss/bookmarklet-1.jpg" width="800">

3. ブックマークレットを開く

<img src="http://na2hiro.github.io/Kifu-for-JS/readme-ss/bookmarklet-2.jpg" width="800">

4. FlashやJava部分が置き換えられ，Kifu for JSの再生盤になる

<img src="http://na2hiro.github.io/Kifu-for-JS/readme-ss/bookmarklet-3.jpg" width="800">

## 更新ログ / バージョン
[Releases](https://github.com/na2hiro/Kifu-for-JS/releases) からどうぞ．

## 動作環境
以下の環境で自動テストによる動作確認を行っています。

* Chrome 88
* Firefox 85

## お願い

* 棋譜形式の対応には注意を払っていますが，もし動作しない棋譜がありましたら対応しますので，Twitterやissuesでご報告いただければ幸いです．
* 要望やバグ報告は [issues](https://github.com/na2hiro/Kifu-for-JS/issues) へよろしくお願いします．
* 棋譜形式そのものについては [JSON棋譜フォーマット](../json-kifu-format#readme) もご参照ください．

## 開発

主な情報は[monorepoトップのREADME](../../README.md#開発)をご覧ください。`kifu-for-js`固有の情報は以下の通りです。

### 関連ツール・ライブラリ

* [na2hiro/json-kifu-format](../json-kifu-format) 1.0: 将棋の盤駒を扱うライブラリ
* [na2hiro/Shogi.js](../shogi.js): 将棋の盤駒を扱うライブラリ
* TypeScript
* React
* React DnD
* MobX
* Webpack (バンドルツール)
* Jest (テストフレームワーク，カバレッジ計測)
* Cypress (end-to-endテスト)
* TSLint (Linter)

### E2E テスト

```shell
npm run cypress:open
```

開発サーバが立ち上がっている状態(例えば`npm run dev`の後)でCypressによるend-to-end (E2E)テストを行えます。 実際のブラウザの様子を確認でき、ソースまたはテストコードが変更されるたびに走ります。

## License
[Shogi images by muchonovski](http://mucho.girly.jp/bona/) below `images` directory are under a [Creative Commons 表示-非営利 2.1 日本 License](http://creativecommons.org/licenses/by-nc/2.1/jp/).

Other files are released under MIT license. See LICENSE.txt.
