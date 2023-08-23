import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スタイルを調整する

Kifu for JSの盤面と周辺機能は、SVG画像として出力されます。ウィジェットを画像のように拡大縮小して扱え、レイアウト調整が容易です。大きさは次のとおりです。

* 通常の再生盤：横3:縦4 (300:400)
* 静的図面：横6:縦5 (300:250)

## モバイル/デスクトップ両対応レイアウト

デフォルトで、描画された`<svg>`要素には`max-width: 400px`が指定されています。これにより、モバイルなどの縦長の画面では横幅いっぱいに伸び、デスクトップなどの横長の画面では最大でも横400px縦533px（静的図面は横400px縦333px）まで伸び、多くの場合で適切な大きさで表示されます。

export const Example = (props) => <KifuLite {...props} kifu={`
後手の持駒：飛二　金四　桂四　香四　歩十八
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・v銀v玉v銀 ・ ・ ・|一
| ・ ・ ・ ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ 銀 ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ 角|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：銀
*最も有名な古典詰将棋。
*銀で押さえ込むのは難しそうに見えるが？
▲５二角成
*焦点の捨て駒が好手。
△同銀右 ▲６二銀打
*どちらで取っても玉のコビンが空いて詰み。
まで3手で詰み
`} />;

<Example />

### `max-width`を指定する/解除する

`max-width`をデフォルトの400pxから変更したり、解除していくらでも伸びるようにすることもできます。[最大横幅](./options/max-width)をご覧ください。

<details>
  <summary>`max-width`を指定しない場合、横長画面のデスクトップやタブレット等で異様に大きくなってしまう場合に注意してください。例を開く：</summary>
  <div>
   <Example maxWidth={null} />
  </div>
</details>

## CSSを当てる

これだけでは足りない場合、盤の`<svg>`要素にCSSを当ててスタイルを調整することもできます。svg要素には`class="kifuforjs-lite"`が付与されるため、次のように全ての盤に対して一括してCSSを適用することができます。

```html
<style>
  .kifuforjs-lite {
    border: 1px black solid;
  }
</style>
```

個別の盤に対してCSSを当てるには、次のようにします。

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

配色は、多くのサイトのデザインにマッチしやすいよう考慮されています。

* 盤駒、棋譜、棋譜コメントは、そこで使用されている文字色をそのまま使用します。 (CSSの`color` プロパティ)
* 背景色は、そこで使用されている背景色をそのまま使用します。
* ボタンや枠は無彩色であるグレーになっており、なるべくデザインの邪魔をしないようになっています。

### ダークモード対応

これにより、ダークモードに対応しているサイトに埋め込んでも、なるべく違和感なく表示されるようになっています。このサイトも実はダークモードに切り替えられます。メニューバーからお試しください。

<Example />

### 配色例

[CSSを当てる](#cssを当てる)ことで、盤駒の色を指定できます。ここでは、配色の例をいくつか紹介します。

:::info
この例は、このドキュメンテーションで使用されているテーマが原因で、ダークモードではうまく表示されません。ライトモードでご覧ください。
:::

背景色が次のように白でも黒でもない場合、特に指定なしで表示すると次のようになります。これでも使えますが、やや盤面が見づらい場合も考えられます。

<p style={{backgroundColor: "#ccffcc", padding: "10px"}}>
  <Example style={{color: "black"}} />
</p>

一つの方法は、白地に黒文字（ダーク系ページの場合、黒地に白文字）を指定する方法です。

<p style={{backgroundColor: "#ccffcc", padding: "10px"}}>
  <Example style={{backgroundColor: "white", color: "black"}} />
</p>

```html
<style>
  .kifuforjs-lite {
    background-color: white;
    color: black;
  }
</style>
```

背景に透明度を指定すると、よりサイトの雰囲気に馴染みます。

<p style={{backgroundColor: "#ccffcc", padding: "10px"}}>
  <Example style={{backgroundColor: "rgba(255, 255, 255, 0.8)", color: "black" }} />
</p>

```html
<style>
    .kifuforjs-lite {
        // highlight-start
        background-color: rgba(255, 255, 255, 0.8);
        // highlight-end
        color: black;
    }
</style>
```

また、次のように背景画像の細部が気になる場合は、

<p style={{background: "url(/img/logo.svg)", padding: "10px"}}>
  <Example style={{backgroundColor: "rgba(255, 255, 255, 0.8)", color: "black"}} />
</p>

ぼかしのバックドロップフィルタを入れ、不透明度を高めると良いです。

<p style={{background: "url(/img/logo.svg)", padding: "10px"}}>
  <Example style={{backgroundColor: "rgba(255, 255, 255, 0.9)", color: "black", backdropFilter: "blur(5px)"}} />
</p>

```html
<style>
  .kifuforjs-lite {
    // highlight-start
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    // highlight-end
    color: black;
  }
</style>
```
