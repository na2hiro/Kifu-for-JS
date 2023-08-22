# `<KifuLite>` Reactコンポーネント

## 前提

* `react`と`react-dom`はpeerDependenciesに入っており、インストールする必要があります。hooksを使用しているため、React 16.8以上が必要です。
* 状態管理に`mobx@4`と`mobx-react@6`を使用しています。

## 一旦描画するだけの場合

盤を表示したあと、特にその盤を監視したり操作したりする必要ない場合かつ、optionsも後に変更する必要がない場合は、このコンポーネントをuncontrolledな状態で使用できます。すなわち、`kifuStore` propを使わず、`<KifuLite>`コンポーネントのpropsにオプションをオブジェクトとして渡すだけでよいです。

optionsは、最初の描画時にKifuStoreを生成する際に使われるのみで、あとからpropを変更しても反映されません。

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

## 描画後に監視・操作したりoptionsを変更する場合

盤を表示した後、盤の状態を監視したり操作したりする必要があったり、optionsを後から変更する必要がある場合は、このコンポーネントをcontrolledな状態で使用する必要があります。すなわち、`kifuStore` propに`KifuStore`オブジェクトを渡し、このオブジェクトを介して状態を監視したり操作したりします。

例えば、渡されたplyに応じて盤面を変更するには、次のようにします。

```tsx
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
