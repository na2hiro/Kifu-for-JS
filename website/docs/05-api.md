# 高度: プログラムとの連携、API

## mobx を用いた状態監視と操作

状態管理ライブラリ[mobx](https://mobx.js.org)の状態を外部に向けて提供しています。これにより、局面が変わったときに何か処理を行ったり、反対に外側から局面を操作したりすることができます。

### 例

```ts
TODO: 例を書く
```

TODO: どのようのKifuStoreを取得できるか

### `KifuStore` の observable なフィールド

`KifuStore`は、observableなオブジェクトです。以下のフィールドがあります。

#### `player: JKFPlayer`

将棋の盤面と棋譜の状態を表す、JKFPlayerのインスタンスです。次のフィールドが observable になっています。

* `shogi`: 現在表示すべき局面の状態
    * `board`: 盤面、9x9の二次元配列
    * `hands`: 持ち駒、駒種のCSA表記から数へのマッピングをそれぞれ先手と後手についてこの順に持つ配列
    * `turn`: 手番 (`Color.Black` すなわち `0`、 または `Color.White` すなわち `1`)
* `forkPointers`: 現在の局面が分岐している場合、分岐手数目と何番目の分岐に当たるかのペアのリスト
* `kifu`: 表示すべき棋譜のリスト。分岐の場合、現在の分岐に至るまでの初手からの棋譜と今後の棋譜がそれぞれ格納されています。 <!-- TODO: 分岐の場合の説明を追加する -->
* `tesuu`: 現在の手数

また、次のメソッドがあります。

* TODO: JSDocへリンク

#### `errors: string[] = []`

表示すべきエラーの文字列が格納されます。

#### `filePath: string = undefined`

`loadFile()`で読み込まれた棋譜ファイルのパスを表します。 `loadKifu()`で読み込まれた場合は`undefined`です。

#### (legacy) `reversed: boolean = false`

盤面が反転表示されているかどうかを表します。v5以降のlegacy版ではない Kifu for JS は反転機能がないため、特に意味は持ちません。

### `KifuStore` の作成

`new KifuStore()`とすることで空の棋譜を作成できます。

### `KifuStore` の操作

* 棋譜読み込み
  * `loadFile(filePath: string)` 棋譜ファイルを読み込む
  * `loadKifu(kifu: string)` 棋譜を直接渡して読み込む

## Reactコンポーネント

Reactでアプリケーションを作成している場合は、Kifu for JSをReactコンポーネントとして直接利用することができます。`KifuLite`コンポーネントはSVG要素を返します。コントローラとして、`KifuStore`を渡します。

```tsx title="MyComponent.tsx"
import React, { useEffect, useState } from "react";
import { KifuLite, KifuStore } from 'kifu-for-js';

const MyComponent = ({ filePath }) => {
  const [kifuStore, setKifuStore] = useState(null);
  useEffect(() => {
    const newKifuStore = new KifuStore();
    newKifuStore.loadFile(filePath); // 非同期読み込みであることに注意
    setKifuStore(newKifuStore)
  }, [filePath]);
  
  return (
    <KifuLite kifuStore={kifuStore} />
  )
}

export default MyComponent;
```
