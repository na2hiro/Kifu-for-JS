# Shogi.js
将棋の盤駒を扱うシンプルなJavaScriptライブラリ．DOM, jQuery等不使用．TypeScript．

## 概要
* 最低限の将棋の法則に従って操作ができる．
	* 局面を平手に並べることができる．
	* 駒を移動(move)すると，移動先の駒を取れる．
	* 駒を打つ(drop)ことができる．
	* 動作を戻すことができる．
* モード(editMode)
	* 通常(false)
		* 手番と動きを守っているかどうかをチェック
		* 手番を管理
	* 編集(true): 
		* 手番や動きをチェックしない
		* 手番を変更する
		* 盤上の駒を駒台に載せる
		* 盤上の駒を裏返し・反転させる

## Class詳細
"//"が付いているものは未実装
### class Shogi
####initialize()
局面を平手に並べる．

#### editMode(flag: boolean)
編集モード切り替え

#### move(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean)
(fromx, fromy)から(tox, toy)へ移動し，適当な処理を行う．

#### drop(tox: number, toy: number, kind: string, color: Color)
(tox, toy)へcolorの持ち駒のkindを打つ．

#### unmove(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean, capture?: string)
moveの逆を行う．captureは取った駒の種類．

#### undrop(tox: number, toy: number)
dropの逆を行う．

#### get(x: number, y: number): Piece
(x, y)にある駒を返す

#### getHandsSummary(color: Color): {[index: string]: number}
keyを種類，valueを枚数とするオブジェクトとして持ち駒の枚数一覧を返す．

#### toCSAString()
CSAによる盤面表現の文字列を返す

#### editMode(flag)
trueで編集モードに入る．(標準はfalseの通常モード)
* 通常モード：移動時に手番と移動可能かどうかチェックし，移動可能範囲は手番側のみ返す．
* 編集モード：移動時に手番や移動可能かはチェックせず，移動可能範囲は両者とも返す．

#### // clear(x: number, y: number)
(x, y)の駒を駒箱に入れる．

#### // clearAll()
全て駒箱に入れる．

### enum Color
Black=0, White=1
### Pieceクラス
#### コンストラクタ(csa: string)
"+FU"などのCSAによる駒表現から駒オブジェクトを作成

#### promote() / unpromote()
成る / 不成にする

#### inverse()
向きを逆にする

#### toCSAString()
CSAによる駒表現の文字列を返す

## TODO
* 駒箱
* テストを書く

## 開発環境


```
$ npm install

```

で下記の必要モジュールをインストールできます．

* TypeScript 1.5
* gulp 3.9 (自動化ツール)
	* gulp-typescript 2.8
	* gulp-mocha 2.1 (テストフレームワーク)
	* gulp-istanbul 0.10 (カバレッジ計測)
	* gulp-webserver 0.9 (ライブリロード付きサーバ)


```
$ ~/node_modules/.bin/gulp # パスが通っている場合は単にgulp
```

を起動すると，コンソールでテスト結果が表示され，カバレッジレポートが立ち上がります．ソースコードを変更するとTypeScriptのコンパイルとテストが，テストを変更するとテストが走り，カバレッジレポートがリロードされます．

開発時にこれを起動しておくと，テストの通過具合とカバレッジの網羅具合を確認しながら開発できます．テストがすべて通過していることとカバレッジが十分高いことを確認できたらコミットしてください．

コンパイルは`gulp build`，テストは`gulp test`でも実行できます．

## license

MIT License (see LICENSE.txt)
