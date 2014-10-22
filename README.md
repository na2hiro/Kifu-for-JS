# JSON棋譜フォーマット(JKF)
JSONで将棋の棋譜を取り扱う標準形式JKFを定義し，また既存のKIF, KI2, CSA等との相互変換を行うライブラリを提供します．(予定)

##概要
現在仕様策定と実装を進めつつあります．

* 現状の問題として，既存のKIF, KI2, CSA形式が持つ情報はバラバラであり，アプリケーション側の対応に手間がかかる．
* 上記形式の情報に加え，棋譜再生や表示に必要な情報を持った形式をJSONで表し，これを流通用の**JSON棋譜フォーマット(JKF)**とする．
	* JKFが一般的になれば，棋譜再生を行うアプリケーションの作成が容易になる．
	* 一例として，JKFを元に棋譜再生を行うJKFPlayerクラス(JavaScript)を提供する．
* KIF, KI2, CSA各形式のパーサ(JavaScript)を用意し，JKFへ変換できるようにする．
	* これはパーサジェネレータによるパーサである．つまり，**KIF, KI2, CSA形式のEBNF表現**を提供している．これは将棋界において画期的である．

### 棋譜形式の比較

| フォーマット | KIF | KI2 | CSA | JKF |
| --- | --- | --- | --- | --- |
| 0) 1) 元座標(from) | ○ | △(要相対逆算) | ○ | ○ |
| 1) 取った駒(capture) | × | × | × | ○ |
| 1) 2) 成り(promote) | ○(不成なし) | ○ | △ | ○ |
| 2) 相対情報(relative) | △ | ○ | △ | ○ |
| 2) 同〜(same) | ○ | ○ | × | ○ |
| 手番(color) | × | ○ | ○ | ○ |
| 消費時間(time) | ○ | × | ○ | ○ |

○=棋譜だけで可能 △=現在の局面を見れば可能 ×=不可能か，以前の局面を見れば可能

* 0) 局面を1手進めるために必要な情報
* 1) 局面を1手戻すために必要な情報
* 2) 可読棋譜にするために必要な情報
* 相対情報: 上下左右など，同じ座標に複数の駒が移動できる場合に駒を区別するための情報．
* 相対逆算: 局面と座標と相対情報から，その位置に移動する駒を特定すること．

##形式の定義
### JSONの形式
`JSONKifuFormat.d.ts`にある内容です．変更され得ます．"?"はない場合があるという意味です．小文字で始まる`型名`は組み込み型です．

* JKFが持つフィールドの定義
	* header `string=>string` ヘッダ情報
	* initial? 初期局面(なければ平手)
		* preset `InitialPresetString` 手合名
		* data? 初期局面データ(手合名がOTHERの時に使用)
			* color: `Color` 初手が先手側ならtrue, 後手側ならfalse
			* board: `以下[][]` board[x-1][y-1]に(x,y)の駒情報．駒がない場合は空オブジェクト`{}`
				* color?: `Color` 先手/後手
				* kind?: `string` 駒の種類
			* hands: `(string=>number)[]` 駒種がkey, 枚数がvalueの連想配列．0番目が先手，1番目が後手の持駒
	* moves `MoveFormat[]` n番目はn手目の棋譜(0番目は初期局面のコメント用)

上の定義で使うオブジェクトの補助定義は次の通り．

* `MoveFormat` 指し手を表す
	* comments? `string[]` コメント
	* move? 駒の動き
		* color `Color` 先手/後手
		* from? `PlaceFormat` 移動元 打った場合はなし
		* to `PlaceFormat` 移動先
		* piece `string` 駒の種類(`FU` `KY`等のCSA形式)
		* same? `boolean` 直前と同じ場合
		* promote? `Bool` 成るかどうか true:成, false:不成, 無いかnull:どちらでもない
		* capture? `string` 取った駒の種類
		* relative? `RelativeString` 相対情報
	* time? 消費時間
		* now `TimeFormat` 1手
		* total `TimeFormat` 合計
	* special? `string` 特殊棋譜(CSAのTORYO, CHUDAN等)
	* forks? `MoveFormat[][]` 任意の長さの分岐を任意個格納する
* `TimeFormat` 時間を表す
	* h? `Integer` 時
	* m `Integer` 分
	* s `Integer` 秒
* `PlaceFormat` 座標を表す
	* x `Integer` 1から9
	* y `Integer` 一から九

エイリアスは次の通り．

* `Color = boolean` 陣営を表す． 先手: true, 後手: false
* `RelativeString = string` 以下の文字列を連結したもの
	* 左, 直, 右: それぞれL, C, R(Left, Center/Choku, Right)
	* 上, 寄, 引: それぞれU, M, D(Up, Middle, Down)
	* 打: H(Hit 何か違う気もする)
* `InitialPresetString = string` 平手，香落ち等KIFでサポートされている手合情報
	* HIRATE: 平手
	* KY: 香落ち
	* KY_R: 右香落ち
	* KA: 角落ち
	* HI: 飛車落ち
	* HIKY: 飛香落ち
	* 2: 二枚落ち
	* 3: 三枚落ち
	* 4: 四枚落ち
	* 5: 五枚落ち	
	* 5_L: 左五枚落ち
	* 6: 六枚落ち
	* 8: 八枚落ち
	* 10: 十枚落ち
	* OTHER: その他

### 文字コード
JSONで一般的なUTF-8を使用するものとします．

## プログラム

* `kifuplayer.js`: KIF/KI2/CSA/JKFから棋譜再生を行うライブラリ(下5つとshogi.jsを連結したもの．)
	* `kif-parser.{pegjs/js}`: KIFをJSON形式に一対一変換するパーサ
	* `ki2-parser.{pegjs/js}`: KI2をJSON形式に一対一変換するパーサ
	* `csa-parser.{pegjs/js}`: CSAをJSON形式に一対一変換するパーサ
	* `normalizer.{ts/js}`: {KIF/KI2/CSA}と同等の情報しか持たないJKFを完全なJKFに変換するプログラム
	* `player.{ts/js}`: JKFを扱う棋譜再生盤の例

## 依存ライブラリ
使用に必要なものは同梱してあります．

* TypeScript 0.9.5.0
* [na2hiro/Shogi.js](https://github.com/na2hiro/Shogi.js): 将棋の盤駒を扱うライブラリ
* [PEG.js](http://pegjs.majda.cz/): パーサジェネレータ

## TODO
KIF, KI2, CSAの詳しい仕様を知らないので，漏れがあったら教えて下さい．

* [issues](https://github.com/na2hiro/json-kifu-format/issues)参照．


## reference

* [CSA標準棋譜ファイル形式](http://www.computer-shogi.org/protocol/record_v22.html)
* [shogi-format](https://code.google.com/p/shogi-format/): こちらは昔自ら提案したもの．大風呂敷だったため挫折しました．今回はより小さく洗練された形式を目指しており，また実装を用意し実用第一で進めていきます．
* [棋譜の表記方法](http://www.shogi.or.jp/faq/kihuhyouki.html): 相対情報の書き方
* [棋譜の形式について - 将棋の棋譜でーたべーす](http://wiki.optus.nu/shogi/index.php?post=%B4%FD%C9%E8%A4%CE%B7%C1%BC%B0%A4%CB%A4%C4%A4%A4%A4%C6): 出回っている棋譜形式のまとめ

## license

MIT License (see LICENSE.txt)
