# はじめる

## CDNを利用して設置（おすすめ）

jsDelivrの提供するCDN上からKifu for JSを簡単に読み込むことができます。次のコードをページ内に埋め込んでください。

```html
<script src="https://cdn.jsdelivr.net/npm/kifu-for-js@4/bundle/kifu-for-js.min.js" charset="utf-8"></script>
```


さっそく再生盤を表示してみましょう。

```html
<script type="text/kifu">
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
▲５二角成　△同銀右　▲６二銀打　で詰み
</script>
```

これで、ページに再生盤が表示されました。

TODO: 画像

別途.kifファイルなどを読み込ませたい場合は[棋譜の読み込み方式](./configuration/loading-method)を参照してください。

### バージョン指定について

jsDelivrのURL `https://cdn.jsdelivr.net/npm/kifu-for-js@4/bundle/kifu-for-js.min.js` 中の `@4` の部分は、バージョン`4.*.*`の最新を読み込むという指定で、機能追加・バグ修正更新が自動で反映されます。

[Semantic Versioning](https://semver.org/) を採用しているため、後方互換性のない変更がある場合はメジャーバージョンアップを行い`5.*.*`台にするつもりですが、特に安定性を重視したいなどの理由で手動でマイナー・パッチ対応を行いたい場合は、`@4.0.0`などとバージョンを固定して下さい。

## npmモジュールとして利用

```shell
npm install kifu-for-js
```

描画をライブラリに任せる場合は次のとおりです。

```ts title="show-shogi.ts"
import {load} from "kifu-for-js";

function loadKifu() {
  load(""); // TODO: インターフェイスをどうするか？
}
```

Reactコンポーネントを利用する場合は次のとおりです。（詳しくは[高度: プログラムとの連携、API#Reactコンポーネント](./api#react%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88)を参照）

```tsx title="MyApp.tsx"
import {Kifu} from "kifu-for-js";

export default function MyApp({kifuStore}) {
  return (
    <Kifu kifuStore={kifuStore} />
  )
}
```

## さらに

Kifu for JSが設置できたら、見た目などをカスタマイズしてみましょう。
