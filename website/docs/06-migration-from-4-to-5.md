# v4からv5への移行手順

ここでは、お使いのKifu for JS v3あるいはv4を、最新版であるv5に移行する手順を説明します。

* **legacy版**: Kifu for JS v4以前の、Kifu for Java/Flashとの互換性を保ったUXを持つKifu for JSのこと
* **最新版**: Kifu for JS v5で導入された、スマホに最適化されたUXを持つKifu for JSのこと

## A) `<script>`タグでKifu for JSを読み込んでいる標準的な場合

次のような`<script>`タグを記述することでKifu for JSを読み込んでいる場合、二通りのオプションがあります。

```html
<script src="https://cdn.jsdelivr.net/npm/kifu-for-js@4/bundle/kifu-for-js.min.js" charset="utf-8"></script>
```

### オプション1: legacy版の使用をやめ、すべて最新版に移行する

既存ページでlegacy版で表示されている将棋再生盤を最新版に移行し、以後全て最新版を使用する場合は、読み込みスクリプトのバージョンを5に上げるだけで、最新版に移行できます。

```html
<script src="https://cdn.jsdelivr.net/npm/kifu-for-js@5/bundle/kifu-for-js.min.js" charset="utf-8"></script>
```

次のようなマークアップは、最新版として動作します。

```html
<script>KifuForJS.load("../json-kifu-format/jt201409130101.kif");</script>
```
```html
<script>KifuForJS.load("../json-kifu-format/jt201409130101.kif", "board");</script>
〜
<div id="board"></div>
```

### オプション2: すでにある盤はそのままに、最新版を混在させる

既存ページのレイアウトの関係などから、すでにある盤でlegacy版を使い続け、新たに設置する盤面については最新版を使いたいといった場合は、v5のlegacy版を含んだスクリプト`kifu-for-js-legacy.min.js`を読み込むようにします。

```html
<script src="https://cdn.jsdelivr.net/npm/kifu-for-js@5/bundle/kifu-for-js-legacy.min.js" charset="utf-8"></script>
```

すると、既存の記述はそのままKifu for JS legacy版として動きます。

```html
<script>KifuForJS.load("../json-kifu-format/jt201409130101.kif");</script>
```

新しい方式で記述された盤面については最新版として動きます。

```html
<script type="kifu" data-src="../json-kifu-format/jt201409130101.kif"></script>
```

`load()`関数を用いる場合は、`mode: "latest"`オプションを渡すことで最新版を使うことができます。

```html
<script>KifuForJS.load("../json-kifu-format/jt201409130101.kif", {mode: "latest"});</script>
```

## B) npmモジュールとして利用している場合

v5は新旧両方のKifu for JSを提供しています。次のようにバージョンを上げ、

```shell
npm install kifu-for-js@^5
```

このような既存のコードは最新版を使うようになります。

```ts
import {load} from "kifu-for-js";

load("foobar.kif")
```

legacy版を使いたい場合は、import先を変更します。

```ts
import {load} from "kifu-for-js/legacy";

load("foobar.kif")
```

## 付録: バージョンとlegacy版、最新版の対応表

| バージョン                                                   | legacy版 | 最新版 |
|---------------------------------------------------------|---------|-----|
| 3.x.x, 4.x.x                                            | ✅       | -   |
| 5.x.x (kifu-for-js.min.js)                              | -       | ✅   |
| 5.x.x (kifu-for-js-legacy.min.js)<br />5.x.x (npmモジュール) | ✅       | ✅   |

