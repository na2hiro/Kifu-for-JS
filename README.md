# Shogi.js
将棋を扱うJavaScriptライブラリ．

## 概要
* 最低限の将棋の法則に従って操作ができる．
	* 局面を平手に並べることができる．
	* 駒を移動(move)すると，移動先の駒を取れる．
	* 駒を打つ(put)ことができる．

## Class詳細
"//"が付いているものは未実装
### class Shogi
####initialize()
局面を平手に並べる．

#### move(fromx: number, fromy: number, tox: number, toy: number, promote?: boolean)
(fromx, fromy)から(tox, toy)へ移動し，適当な処理を行う．

#### put(tox: number, toy: number, kind: string, color: Color)
(tox, toy)へcolorの持ち駒のkindを打つ．

#### toCSAString()
CSAによる盤面表現の文字列を返す

#### // clear(x: number, y: number)
(x, y)の駒を駒箱に入れる．

#### // clearAll()
全て駒箱に入れる．

#### // recordMode(flag)
trueで棋譜に記録するモードに入る．(標準はfalseの編集モード)

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