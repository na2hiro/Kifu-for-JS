# `<KifuLite>` Reactコンポーネント

## 前提

* `react`と`react-dom`はpeerDependenciesに入っており、ライブラリ使用側でインストールする必要があります。hooksを使用しているため、React 16.8以上が必要です。
* 状態管理に`mobx@4`と`mobx-react@6`を使用しています。

## 設計思想

* `<KifuLite>` は、`KifuStore`オブジェクトをprop経由で受け取り、そのオブジェクトを介して盤の状態を監視・操作します。
* `<KifuLite>` は、監視・操作が不要な場合の簡単のため、オプションオブジェクト `options` を直接propsとして受け取れます。

## 一旦描画するだけの場合

盤を表示したあと、特にその盤を監視したり操作したりする必要ない場合かつ、`options`も後に変更する必要がない場合は、このコンポーネントをuncontrolledな状態で使用できます。すなわち、`kifuStore` propを使わず、`<KifuLite>`コンポーネントのpropsにオプションをオブジェクトとして渡すだけでよいです。

```tsx
import { KifuLite } from "kifu-for-js";

const options = {
    kifu: "▲７六歩 △３四歩",
    ply: 2,
    static: {
        last: "hidden"
    }
}

function MyComponent () {
    return <KifuLite {...options} />
}
```

:::caution

`options`は、最初の描画時にKifuStoreを生成する際に使われるのみで、あとからpropを変更しても反映されません。

```tsx title="誤り"
import { useState } from "react";
import { KifuLite } from "kifu-for-js";

const options = {
    kifu: "▲７六歩 △３四歩",
    static: {
        last: "hidden"
    }
}

function MyComponent () {
    const [ply, setPly] = useState(0);
    return (
      <>
        <button onClick={() => setPly(ply + 1)}>一手進める</button>
        {/* ⚠️ plyが変わっても反映されない*/}
        <KifuLite {...options} ply={ply} />
      </>
    )
}
```

:::

## 描画後に監視・操作したりoptionsを変更する場合

盤を表示した後、盤の状態を監視したり操作したりする必要があったり、`options` を後から変更する必要がある場合は、このコンポーネントをcontrolledな状態で使用する必要があります。すなわち、`kifuStore` propに`KifuStore`オブジェクトを渡し、このオブジェクトを介して状態を監視したり操作したりします。

具体的には次のように、optionsを使って`KifuStore`オブジェクトを生成し、`<KifuLite>`の`kifuStore` propに渡します。この例では、`MyComponent`に渡されたplyが変わるのに応じて局面も変更します。

```tsx
import { useEffect, useState } from "react";
import { KifuLite } from "kifu-for-js";

const options = {
    kifu: "▲７六歩 △３四歩",
    static: {
        last: "hidden"
    }
}

function MyComponent ({ply}) {
    const [kifuStore, setKifuStore] = useState(() => new KifuStore({...options, ply}));
    
    useEffect(() => {
        kifuStore.player.goto(ply);
    }, [ply])
    
    return <KifuLite kifuStore={kifuStore}/>
}
```

なお、uncontrolledな(`kifuStore` propが渡っていない) `<KifuLite>` を簡単にcontrolledにするために、`kifuStore`と他の`options`を同時にpropsに渡す方法も許容されています。

```tsx
import { useEffect, useState } from "react";
import { KifuLite } from "kifu-for-js";

const options = {
  kifu: "▲７六歩 △３四歩",
  static: {
    last: "hidden"
  }
}

function MyComponent ({ply}) {
  // highlight-start
  // optionsを渡していないことに注意
  const [kifuStore, setKifuStore] = useState(() => new KifuStore());
  // highlight-end

  useEffect(() => {
    kifuStore.player.goto(ply);
  }, [ply])

  // highlight-start
  // propsにoptionsを渡す
  return <KifuLite kifuStore={kifuStore} ply={ply} {...options}/>
  // highlight-end
}
```

:::caution
`KifuLite`に`kifuStore`以外のpropsを渡した場合、`new KifuStore(options)`に渡された`options`の値は上書きされるため無視されます。

```tsx title="誤り"
import { useEffect, useState } from "react";
import { KifuLite } from "kifu-for-js";

const options = {
  kifu: "▲７六歩 △３四歩",
  static: {
    last: "hidden"
  }
}

function MyComponent ({ply}) {
  // highlight-start
  // ⚠️ ここで渡したoptionsは無視される！
  const [kifuStore, setKifuStore] = useState(() => new KifuStore(options)); 
  // highlight-end

  useEffect(() => {
    kifuStore.player.goto(ply);
  }, [ply])

  // highlight-start
  // plyを指定しているため、再度optionsの初期化が行われ、KifuStoreに渡された値は無視される
  return <KifuLite kifuStore={kifuStore} ply={ply}/>
  // highlight-end
}
```
:::
