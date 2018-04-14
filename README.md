# JSON棋譜フォーマット(JKF)
JSONで将棋の棋譜を取り扱う標準形式JKFを定義しています．またJKFを既存のKIF, KI2, CSA等から変換するライブラリ及びJKFを用いて盤面再生を行うライブラリを提供します．

## 概要

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

## 形式の定義
以下で定義される形式をVersion 1.0とします．1.x台では後方互換性を保つ変更のみを採用します．

### JSONの形式 (Version 1.0)
`Formats.ts`にある内容です．"?"はない場合があるという意味です．小文字で始まる`型名`は組み込み型です．

* JKFが持つフィールドの定義
	* header `string=>string` ヘッダ情報．キーはKI2，KIF等の日本語のものに準ずる．(例: "場所", "先手")
	* initial? 初期局面(なければ平手)
		* preset `InitialPresetString` 手合名
		* data? 初期局面データ(手合名がOTHERの時に使用)
			* color: `Color` 初手の手番
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
	* forks? `MoveFormat[][]` 任意の長さの分岐を任意個格納する．分岐の初手はこのforksを持つ棋譜の代替の手とする(次の手ではなく)
* `TimeFormat` 時間を表す
	* h? `Integer` 時
	* m `Integer` 分
	* s `Integer` 秒
* `PlaceFormat` 座標を表す
	* x `Integer` 1から9
	* y `Integer` 一から九

エイリアスは次の通り．

* `Color = number` 陣営を表す． 先手: 0, 後手: 1
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

## JKFの例
`test/`以下にも例が載っています．
### 通常
```
{
  "header": {
    "先手": "na2hiro",
    "後手": "うひょ"
  },
  "moves": [
    {},
    {"move":{"from":{"x":7,"y":7},"to":{"x":7,"y":6},"color":0,"piece":"FU"}},
    {"move":{"from":{"x":3,"y":3},"to":{"x":3,"y":4},"color":1,"piece":"FU"}},
    {"move":{"from":{"x":8,"y":8},"to":{"x":2,"y":2},"color":0,"piece":"KA","capture":"KA","promote":false}},
    {"move":{"from":{"x":3,"y":1},"to":{"x":2,"y":2},"color":1,"piece":"GI","capture":"KA","same":true}},
    {"move":{"to":{"x":4,"y":5},"color":0,"piece":"KA"}},

    {"special": "CHUDAN"}
  ]
}
```

### 分岐
```
{
  "header": {},
  "moves": [
    {"comments":["分岐の例"]},
    {"move":{"from":{"x":7,"y":7},"to":{"x":7,"y":6},"color":0,"piece":"FU"}},
    {"move":{"from":{"x":3,"y":3},"to":{"x":3,"y":4},"color":1,"piece":"FU"}, "comments":["次の手で二種類が考えられる：７七桂か２二角成である．","２二角成を選ぶと筋違い角となる．"]},
    {"move":{"from":{"x":8,"y":9},"to":{"x":7,"y":7},"color":0,"piece":"KE"}, "forks":[
      [
        {"move":{"from":{"x":8,"y":8},"to":{"x":2,"y":2},"color":0,"piece":"KA","capture":"KA","promote":false}},
        {"move":{"from":{"x":3,"y":1},"to":{"x":2,"y":2},"color":1,"piece":"GI","capture":"KA","same":true}},
        {"move":{"to":{"x":4,"y":5},"color":0,"piece":"KA"}}
      ]
    ]},
    {"move":{"from":{"x":2,"y":2},"to":{"x":7,"y":7},"color":1,"piece":"KA","capture":"KE","promote":true,"same":true}},
    {"move":{"from":{"x":8,"y":8},"to":{"x":7,"y":7},"color":0,"piece":"KA","capture":"UM","same":true}},
    {"move":{"to":{"x":3,"y":3},"color":1,"piece":"KE","relative":"H"}}
  ]
}
```

### 駒落ち
```
{
  "header": {},
  "initial": {"preset": "6"},
  "moves": [
    {},
    {"move":{"from":{"x":5,"y":1},"to":{"x":4,"y":2},"color":1,"piece":"OU"}},
    {"move":{"from":{"x":7,"y":7},"to":{"x":7,"y":6},"color":0,"piece":"FU"}},
    {"move":{"from":{"x":6,"y":1},"to":{"x":7,"y":2},"color":1,"piece":"KI"}}
  ]
}
```
### 初形変則
```
{
  "header": {},
  "initial": {
    "preset": "OTHER",
    "data": {
      "board": [
        [{"color":1, "kind":"KY"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {                      }, {"color":0, "kind":"KY"}],
        [{"color":1, "kind":"KE"}, {"color":1, "kind":"KA"},{"color":1, "kind":"FU"}, {}, {}, {}, {                      }, {"color":0, "kind":"HI"}, {"color":0, "kind":"KE"}],
        [{"color":1, "kind":"GI"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {                      }, {"color":0, "kind":"GI"}],
        [{"color":1, "kind":"KI"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {                      }, {"color":0, "kind":"KI"}],
        [{"color":1, "kind":"OU"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {                      }, {"color":0, "kind":"OU"}],
        [{"color":1, "kind":"KI"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {                      }, {"color":0, "kind":"KI"}],
        [{"color":1, "kind":"GI"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {                      }, {                      }, {"color":0, "kind":"GI"}],
        [{"color":1, "kind":"KE"}, {"color":1, "kind":"HI"},{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {"color":0, "kind":"KA"}, {"color":0, "kind":"KE"}],
        [{"color":1, "kind":"KY"}, {                      },{"color":1, "kind":"FU"}, {}, {}, {}, {"color":0, "kind":"FU"}, {                      }, {"color":0, "kind":"KY"}]
      ],
      "color": 0,
      "hands":[
        {"FU":0,"KY":0,"KE":0,"GI":0,"KI":0,"KA":0,"HI":0},
        {"FU":0,"KY":0,"KE":0,"GI":0,"KI":0,"KA":0,"HI":0}
      ]
    }
  },
  "moves": [
    {"comments": ["飛車角先落ち．"]},
    {"move":{"from":{"x":2,"y":8},"to":{"x":2,"y":3},"color":0,"piece":"HI","promote":true,"capture":"FU"}}
  ]
}
```

## プログラム

インストールは

```
npm install json-kifu-format
```

または右のDownload ZIPボタンから．

### ブラウザ用
node.js用のファイルをbrowserifyで１つにまとめたJKFPlayerが用意されています．`require("JKFPlayer")`で読み込むことができます．

* `out/`
	* `jkfplayer.js`: KIF/KI2/CSA/JKFから棋譜再生を行うライブラリ

### node.js用
`d.ts`ファイルはTypeScriptで使用するための型宣言ファイルです．

* `lib/`
	* `kif-parser.{d.ts/js}`: KIFをJSON形式に一対一変換するパーサ
	* `ki2-parser.{d.ts/js}`: KI2をJSON形式に一対一変換するパーサ
	* `csa-parser.{d.ts/js}`: CSA(V1, V2, V2.1, V2.2)をJSON形式に一対一変換するパーサ
	* `normalizer.{d.ts/js}`: {KIF/KI2/CSA}と同等の情報しか持たないJKFを完全なJKFに変換するプログラム
	* `jkfplayer.{d.ts/js}`: JKFを扱う棋譜再生盤の例

### 開発用
libディレクトリの中とほぼ対応しています．

* `src/`
	* `src/Formats.ts`: JKF型宣言ファイル
	* `src/jkfplayer.ts`
	* `src/normalizer.ts`
	* `src/{kif,ki2,csa}-parser.pegjs`

## 開発環境
package.jsonに必要モジュールが書いてあります．パッケージマネージャnpmを使用し，

```
$ npm install

```

を実行することで下記のモジュールをインストールできます．

* TypeScript 1.5
* [na2hiro/Shogi.js](https://github.com/na2hiro/Shogi.js): 将棋の盤駒を扱うライブラリ
* gulp 3.9 (自動化ツール)
	* gulp-typescript 2.8
	* gulp-peg ([PEG.js](http://pegjs.majda.cz/): パーサジェネレータ)
	* gulp-mocha 2.1 (テストフレームワーク)
	* gulp-istanbul 0.10 (カバレッジ計測)
	* gulp-webserver 0.9 (ライブリロード付きサーバ)
* browserify 11.0 (ブラウザ用require)
* iconv, jschardet (文字コード関連)

```
$ ./node_modules/.bin/gulp # パスが通っている場合は単にgulp
```

を起動すると，コンソールでテスト結果が表示され，カバレッジレポートが立ち上がります．ソースコードを変更するとTypeScriptのコンパイルとテストが，テストを変更するとテストが走り，カバレッジレポートがリロードされます．

開発時にこれを起動しておくと，テストの通過具合とカバレッジの網羅具合を確認しながら開発できます．テストがすべて通過していることとカバレッジが十分高いことを確認できたらコミットしてください．

コンパイルは`gulp build`，テストは`gulp test`でも実行できます．

## TODO

[issues](https://github.com/na2hiro/json-kifu-format/issues)参照．
読み込みエラーとなる棋譜があったら教えて下さい．

## reference

* [CSA標準棋譜ファイル形式](http://www.computer-shogi.org/protocol/record_v22.html)
* [shogi-format](https://code.google.com/p/shogi-format/): こちらは昔自ら提案したもの．大風呂敷だったため挫折しました．今回はより小さく洗練された形式を目指しており，また実装を用意し実用第一で進めていきます．
* [棋譜の表記方法](http://www.shogi.or.jp/faq/kihuhyouki.html): 相対情報の書き方
* [棋譜の形式について - 将棋の棋譜でーたべーす](http://wiki.optus.nu/shogi/index.php?post=%B4%FD%C9%E8%A4%CE%B7%C1%BC%B0%A4%CB%A4%C4%A4%A4%A4%C6): 出回っている棋譜形式のまとめ

## license

MIT License (see LICENSE.txt)
