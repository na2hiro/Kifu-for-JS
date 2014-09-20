# JSON棋譜フォーマット(JKF)
JSONで将棋の棋譜を取り扱う標準形式JKFを定義し，また既存のKIF, KI2, CSA等との相互変換を行うライブラリを提供します．(予定)

##概要
現在仕様策定と実装を進めつつあります．

* 既存のKIF, KI2, CSAと一対一に対応するJSON形式を定義し，そのJSON棋譜のtypeとする．
* 各形式のパーサを用意し，各typeのJSON棋譜へ変換できるようにする．
* 各既存形式は互いに足りていない情報があるため，それら全ての情報を持ち，かつ棋譜再生や表示に必要な情報を持ったnormalというtypeを導入し，これを流通用のJSON棋譜形式とする．

| type | KIF | KI2 | CSA | normal |
| --- | --- | --- | --- | --- |
| 0) 1) 元座標(from) | ○ | △(要相対逆算) | ○ | ○ |
| 1) 取った駒(capture) | × | × | × | ○ |
| 1) 2) 成り(promote) | ○ | ○ | △ | ○ |
| 2) 相対情報 | △ | ○ | △ | ○ |
| 2) 同〜(same) | ○ | ○ | × | ○ |
| 消費時間 | ○ | × | ○ | ○ |

△=現在の局面を見れば可能 ×=不可能か，以前の局面を見れば可能

* 0) 局面を1手進めるために必要な情報
* 1) 局面を1手戻すために必要な情報
* 2) 可読棋譜にするために必要な情報
* 相対情報: 上下左右など，同じ座標に複数の駒が移動できる場合に駒を区別するための情報．
* 相対逆算: 局面と座標と相対情報から，その位置に移動する駒を特定すること．

##形式の定義
変更され得ます．

* JKFの定義
	* type `string` 形式のタイプ
	* header `string=>string` ヘッダ情報
	* moves `[以下]` n番目はn手目の棋譜(0番目は初期局面のコメント用)
		* comments `[string]` コメント
		* move? 駒の動き
			* from `place?` 移動元 打った場合はなし
			* to `place` 移動先
			* piece `string` 駒の種類(`FU` `KY`等のCSA形式)
			* same? `boolean` 直前と同じ場合
			* promote? `Bool` 成るかどうか true:成, false:不成, 無いかnull:どちらでもない
			* capture? `string` 取った駒の種類
		* time 消費時間
			* now `time` 1手
			* total `time` 合計
		* special? `string` 特殊棋譜(CSAのTORYO, CHUDAN等)
	* result 文字列 結果(先手,後手,上手,下手,千日手,持将棋)
* `time` 時間を表す
	* h `Integer` 時
	* m `Integer` 分
	* s `Integer` 秒
* `place` 座標を表す
	* x `Integer` 1から9
	* y `Integer` 一から九

## プログラム

* `kif-parser.{pegjs/js}`: KIFをJSON形式に一対一変換するパーサ
* `ki2-parser.{pegjs/js}`: KI2をJSON形式に一対一変換するパーサ
* `csa-parser.{pegjs/js}`: CSAをJSON形式に一対一変換するパーサ

用意する予定のプログラム

* `normalizer.js`: type={KIF/KI2/CSA}であるJSONをtype=normalであるJSONに変換するプログラム

## TODO
KIF, KI2, CSAの詳しい仕様を知らないので，漏れがあったら教えて下さい．

* パーサテスト追加
* 棋譜形式対応
	* 初期局面
	* 分岐

## reference

* [CSA標準棋譜ファイル形式](http://www.computer-shogi.org/protocol/record_v22.html)
* [shogi-format](https://code.google.com/p/shogi-format/): こちらは昔自ら提案したもの．大風呂敷だったため挫折しました．今回はより小さく洗練された形式を目指しており，また実装を用意し実用第一で進めていきます．
