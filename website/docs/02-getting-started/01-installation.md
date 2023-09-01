# ライブラリを読み込む方式

ページにKifu for JSライブラリを読み込むには次の方式があります。

## CDNから読み込む（おすすめ）

jsDelivrの提供するCDN上からKifu for JSを簡単に読み込むことができます。

```html
<script src="https://cdn.jsdelivr.net/npm/kifu-for-js@5/bundle/kifu-for-js.min.js" charset="utf-8"></script>
```

### バージョン指定について

この方式の最大の利点は、Kifu for JSの自動更新を受けられることです。 jsDelivrのURL中の `@5` の部分は、バージョン`5.*.*`のうち最新のバージョンを読み込むという指定です。これにより、機能追加・バグ修正更新が自動で反映されます。

[Semantic Versioning](https://semver.org/) を採用しているため、例えばデザインの大幅な変更や後方互換性のないAPI変更といった変更がある場合は、メジャーバージョンアップを行い`6.*.*`台にします。これにより、不意なアップデートで既存のページが壊れないよう担保します。もし特に安定性を重視したいなどの理由で手動でマイナー、パッチ対応を行いたい場合は、`@5.0.0`などとバージョンを固定して下さい。

## npmモジュールとして利用

アプリケーションに組み込む場合などは、npmモジュールとしても利用できます。

```shell
npm install kifu-for-js
```

描画をライブラリ側に任せる場合、例えば次のようにします。

```html title="page.html"
今回の対局の棋譜はこちら：
<div id="container-id"></div>
```

```ts title="show-shogi.ts"
import {load} from "kifu-for-js";

function loadBoard() {
  load({kifu: "▲７六歩 △３四歩"}, "container-id");
}
```
