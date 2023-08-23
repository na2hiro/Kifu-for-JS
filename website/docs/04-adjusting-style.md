import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スタイルを調整する

Kifu for JSの盤面と周辺機能は、SVG画像として出力されます。ウィジェットを画像のように拡大縮小して扱え、レイアウト調整が容易です。大きさは次のとおりです。

* 通常の再生盤：横3:縦4 (300:400)
* 静的図面：横6:縦5 (300:250)

## モバイル/デスクトップ両対応レイアウト

デフォルトで、描画された`<svg>`要素には`max-width: 400px`が指定されています。これにより、モバイルなどの縦長の画面では横幅いっぱいに伸び、デスクトップなどの横長の画面では最大でも横400px縦533px（静的図面は横400px縦333px）まで伸び、多くの場合で適切な大きさで表示されます。

<KifuLite />

### `max-width`を指定する/解除する

`max-width`をデフォルトの400pxから変更したり、解除していくらでも伸びるようにすることもできます。[最大横幅](./options/max-width)をご覧ください。

<details>
  <summary>`max-width`を指定しない場合、横長画面のデスクトップやタブレット等で異様に大きくなってしまう場合に注意してください。例を開く：</summary>
  <div>
   <KifuLite maxWidth={null} />
  </div>
</details>

## CSSを当てる

これだけでは足りない場合、盤の`<svg>`要素にCSSを当ててスタイルを調整することもできます。

<Tabs groupId="display-method">
  <TabItem value="markup" label="タグ方式" default>

タグ方式では、`<script>`要素の直後に`<ins>`要素が挿入され、その中に`svg`要素が描画されます。

```html
<script type="text/kifu" data-src="./files/kif/jt201409130101.kif" id="board-1">
// highlight-start 
<ins>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" style="font-family: serif; user-select: none; max-width: 450px; aspect-ratio: 300 / 400;">
    <g ...>
    ...
  </svg>
</ins>
// highlight-end
```

こういった構造を利用して、`<ins>`要素にCSSを当てることができます。

```html
<style>
   #board-1 + ins svg {
     border: 1px black solid;
   }
</style>
```

  </TabItem>
  <TabItem value="javascript" label="JavaScript関数方式">

JavaScript関数方式では、コンテナ要素の中に`svg`要素が描画されます。

```html
<div id="board-1">
  // highlight-start    
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" style="font-family: serif; user-select: none; max-width: 450px; aspect-ratio: 300 / 400;">
    <g ...>
      ...
  </svg>
  // highlight-end
</div>
<script>
  KifuForJS.load({src: "./files/kif/jt201409130101.kif"}, "board-1");
</script>
```

`#id` を指定してCSSを当てることができます。

```html
<style>
  #board-1 svg {
    border: 1px black solid;
  }
</style>
```

  </TabItem>
  <TabItem value="react" label="Reactコンポーネント方式">

`<KifuLite>` コンポーネントに `style` propを渡すことで、`svg`要素に直接CSSを当てられます。

```tsx
import {KifuLite} from "kifu-for-js";

export const MyComponent = () => {
  return <>
    <KifuLite src="/kifu/jt201409130101.kif" style={{border: "1px black solid"}} />
  </>;
};
```

  </TabItem>
</Tabs>


## 配色

TODO: ダークモード
