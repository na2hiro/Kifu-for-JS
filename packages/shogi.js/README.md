# Shogi.js (Ver. 2.0) ![Build Status](https://github.com/na2hiro/Shogi.js/actions/workflows/main.yml/badge.svg)
将棋の盤駒をモデルとするシンプルなJavaScriptライブラリ．TypeScript．

## インストール

```shell
npm install shogi.js
```

## 概要
* 最低限の将棋の法則に従って操作ができる．
	* 局面を平手に並べることができる．
	* 駒を移動(move)すると，移動先の駒を取れる．
	* 駒を打つ(drop)ことができる．
	* 動作を戻すことができる．
* モード(editMode)
	* 通常(false)
		* 手番，動きを守っているかどうかをチェック
		* 二歩検査
		* 手番を管理
	* 編集(true): 
		* 手番や動きをチェックしない
		* 手番を変更する
		* 盤上の駒を駒台に載せる
		* 盤上の駒を裏返し・反転させる

通常モードは棋譜再生および対局を，編集モードは盤面編集をモデル化するものである．

## Docs

[TypeDoc ドキュメンテーション](https://apps.81.la/Kifu-for-JS/shogi.js/docs/) を参照のこと。
また，`test`ディレクトリ以下のテストで実際の挙動を確認されたい．

## TODO
https://github.com/na2hiro/Shogi.js/issues

## 開発

### 準備

```shell
$ nvm i && nvm use && npm install
```

上記コマンドを実行することで開発に必要なパッケージをインストールできます．

* TypeScript
* Webpack (バンドルツール)
* Jest (テストフレームワーク，カバレッジ計測)
* TSLint (Linter)

### コマンド


```shell
$ npm run build
$ npm run build:watch
```

ビルドが走ります．`build:watch`の場合，変更されるたびにビルドが走ります．

```shell
$ npm run test:watch
```

コンソールでテスト結果が表示されます．コードの変更が保存されるたびに必要なテストが再実行されるため，実装が既存の有効なテストを壊してないか簡単に確認できます．

```shell
$ npm run test
```

全てのテストが走るとともにカバレッジレポートが表示されます．`coverage/lcov-report/index.html`では，行ごとのカバレッジを確認できます．追加されたコードのブランチカバレッジが100%になるようにしてください．push時にチェックされ満たしていなければ却下されるはずです．

```shell
$ npm run lint
```

コードの品質が検査されます．エラーがあればそれに従い直してください．push前にもチェックされます．

```shell
$ npm run lint:fix
```

自動的に修正可能な問題(インデント等)を直してくれます．

```shell
$ npm run docs
```

`docs/` 以下にドキュメントを生成します．

## license

MIT License (see LICENSE.txt)
