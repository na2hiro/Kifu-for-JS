import {KifuStore, mobxReact} from "kifu-for-js";
import {useState} from "react";
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `KifuStore` による盤の監視と操作

状態管理ライブラリ[mobx](https://mobx.js.org)により定義した盤面及びウィジェットの状態を、外部に向けて提供しています。これにより、局面が変わったときに何か処理を行ったり、反対に外側から局面を操作したりすることができます。

`KifuStore` オブジェクトを介して、盤面の監視及び操作ができます。

## 例

<Tabs groupId="display-method">
  <TabItem value="markup" label="タグ方式" default>

```html
<p>
  現在<span id="tesuu"></span>手目です!
  <button onclick="myKifuStore.player.goto(Math.floor(Math.random()*100))">適当な局面にジャンプ</button>
</p>
<script type="text/kifu" data-src="./files/kif/jt201409130101.kif" id="board-1">
<script>
  KifuForJS.getKifuStore(document.getElementById("board-1").then((kifuStore) => {
    window.myKifuStore = kifuStore;
    KifuForJS.mobx.autorun(()=>{
      document.getElementById("tesuu").textContent = kifuStore.player.tesuu;
    })
  });
</script>
```

  </TabItem>
  <TabItem value="javascript" label="JavaScript関数方式">

```html
<p>
  現在<span id="tesuu"></span>手目です!
  <button onclick="myKifuStore.player.goto(Math.floor(Math.random()*100))">適当な局面にジャンプ</button>
</p>
<script>
  KifuForJS.load("./files/kif/jt201409130101.kif").then((kifuStore) => {
    window.myKifuStore = kifuStore;
    KifuForJS.mobx.autorun(()=>{
      document.getElementById("tesuu").textContent = kifuStore.player.tesuu;
    })
  });
</script>
```

  </TabItem>
  <TabItem value="react" label="Reactコンポーネント方式">

```tsx
import {KifuLite, KifuStore, mobxReact} from "kifu-for-js";

const kifuStore = new KifuStore();

export const MyComponent = mobxReact.observer(() => {
  return <>
    現在{kifuStore.player.tesuu}手目です!
    <button onClick={() => kifuStore.player.goto(Math.floor(Math.random()*100))}>適当な  局面  にジャンプ</button>
    <KifuLite kifuStore={kifuStore} src="/kifu/jt201409130101.kif" />
  </>;
});
```

  </TabItem>
</Tabs>

export const kifuStore = new KifuStore();

export const MyComponent = mobxReact.observer(() => {
  return <>
    <p>現在{kifuStore.player.tesuu}手目です!
    <button onClick={() => kifuStore.player.goto(Math.floor(Math.random()*100))}>適当な局面にジャンプ</button></p>
    <KifuLite kifuStore={kifuStore} src="/kifu/jt201409130101.kif" />
  </>;
});

<MyComponent />

## `KifuStore` オブジェクトを取得する

<Tabs groupId="display-method">
  <TabItem value="markup" label="タグ方式" default>

`<script type="text/kifu">` といったタグを記述することで盤面を表示している場合は、`getKifuStore`関数を使って`KifuStore`オブジェクトの`Promise`を取得できます。盤面が読み込め次第resolveされます。

例えば、次のように盤面を表示させたとします。

```html
<script type="text/kifu" id="board-1">
▲７六歩 △３四歩
</script>
```

次のようにして`KifuStore`を取得できます。

```html
<script>
  KifuForJS.getKifuStore(document.getElementById("board-1")).then(kifuStore => {
    // ここでkifuStoreを使う
  });
</script>
```

  </TabItem>
  <TabItem value="javascript" label="JavaScript関数方式">

`load()`や`loadString()` といったJavaScript関数を呼び出して盤面を表示している場合、実はこれらの関数は`Promise<KifuStore>`を返しているため、戻り地を直接使用できます。棋譜が読み込め次第resolveされます。

```ts
load(filePath, id).then(kifuStore => {
  // ここでkifuStoreを使う
});

// async functionの中では
const kifuStore = await load(filePath, id);
// ここでkifuStoreを使う
```

また、`getKifuStore`にloadする際に指定したDOMを渡して取得することもできます。

```ts
import { getKifuStore } from "kifu-for-js";

const kifuStore = getKifuStore(document.getElementById(id))
```

  </TabItem>
  <TabItem value="react" label="Reactコンポーネント方式">

`<KifuLite>` Reactコンポーネントを利用し、ご自身のReactでアプリケーションから直接描画している場合は、[`KifuStore` オブジェクトを作成し](#kifustore-を作成する)、このコンポーネントの`kifuStore`プロパティに渡すことで、`<KifuLite>` を [controlled なコンポーネント](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)にすることができます。

```tsx title="MyComponent.tsx"
import React, { useEffect, useState } from "react";
import { KifuLite, KifuStore } from 'kifu-for-js';

const MyComponent = ({ filePath }) => {
  const [kifuStore, setKifuStore] = useState(() => new KifuStore());
  
  return (
    <KifuLite src={filePath} kifuStore={kifuStore} />
  )
}

export default MyComponent;
```

詳しくは[`<KifuLite>` Reactコンポーネント](./react-component#%E6%8F%8F%E7%94%BB%E5%BE%8C%E3%81%AB%E7%9B%A3%E8%A6%96%E6%93%8D%E4%BD%9C%E3%81%97%E3%81%9F%E3%82%8Aoptions%E3%82%92%E5%A4%89%E6%9B%B4%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88)を参照してください。

  </TabItem>
</Tabs>

## `KifuStore` を作成する

`new KifuStore(options)`とすることで `KifuStore` オブジェクトを作成できます。

## `KifuStore` を監視する

`KifuStore`は、以下のobservableなフィールドを持ったオブジェクトです。

### `player: JKFPlayer`

将棋の盤面と棋譜の状態を表す、JKFPlayerのインスタンスです。次のフィールドが observable になっています。

* `shogi`: 現在表示すべき局面の状態
    * `board`: 盤面、9x9の二次元配列
    * `hands`: 持ち駒、駒種のCSA表記から数へのマッピングをそれぞれ先手と後手についてこの順に持つ配列
    * `turn`: 手番 (`Color.Black` すなわち `0`、 または `Color.White` すなわち `1`)
* `forkPointers`: 現在の局面が分岐している場合、分岐手数目と何番目の分岐に当たるかのペアのリスト
* `kifu`: 表示すべき棋譜のリスト。分岐の場合、現在の分岐に至るまでの初手からの棋譜と今後の棋譜がそれぞれ格納されています。
* `tesuu`: 現在の手数

### `errors: string[] = []`

表示すべきエラーの文字列が格納されます。

### `filePath: string = undefined`

読み込まれた棋譜ファイルのパスを表します。 棋譜文字列を直接読み込んだ場合は`undefined`です。

### (legacy) `reversed: boolean = false`

盤面が反転表示されているかどうかを表します。v5以降のlegacy版ではない Kifu for JS は反転機能がないため、特に意味は持ちません。

## `KifuStore` を操作する

`KifuStore` を操作する主なメソッドは次のとおりです。

* 棋譜を読み込む
  * `KifuStore#loadFile(filePath: string)` 棋譜ファイルを読み込む
  * `KifuStore#loadKifu(kifu: string)` 棋譜文字列を渡して読み込む
* 棋譜を再生する
  * `KifuStore#player.forward()` 1手進む
  * `KifuStore#player.forward()` 1手戻る
  * `KifuStore#player.go(te: number)` `te` 手進む/戻る
  * `KifuStore#player.goto(tesuu: number, forkPointers?: [number, number][])` 指定した手数にジャンプする（必要であれば分岐ポインタも渡す）
