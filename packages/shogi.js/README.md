# Shogi.js ![Build Status](https://github.com/na2hiro/Kifu-for-JS/actions/workflows/main.yml/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/shogi.js.svg)](https://badge.fury.io/js/shogi.js)

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

## バグ・要望等
https://github.com/na2hiro/Kifu-for-JS/issues へお寄せください

## 開発
[monorepoトップのREADME](../../README.md#開発)をご覧ください。

## license

MIT License (see LICENSE.txt)
