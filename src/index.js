/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import Kifu from "./Kifu.js";
import React from "react";
import {render} from "react-dom";

// ファイルオブジェクトと読み込み完了後のコールバック関数を渡す
// 読み込み完了後，callback(ファイル内容, ファイル名)を呼ぶ
function loadFile(file, callback){
	var reader = new FileReader();
	var encoding = getEncodingFromFileName(file.name);
	reader.onload = function(){
		callback(reader.result, file.name);
	};
	reader.readAsText(file, encoding);
}

function getEncodingFromFileName(filename){
	var tmp = filename.split("."), ext = tmp[tmp.length-1];
	return ["jkf", "kifu", "ki2u"].indexOf(ext)>=0 ? "UTF-8" : "Shift_JIS";
}

export default class KifuController{
	constructor(id){
		if(!id){
			id = "kifuforjs_"+Math.random().toString(36).slice(2);
			document.write("<div id='"+id+"'></div>");
		}
		this.id = id;
	}
	loadKifu(kifu){
		$(document).ready(() => {
			var container = document.getElementById(this.id);
			render(
				<Kifu kifu={kifu} ImageDirectoryPath={KifuController.settings.ImageDirectoryPath}/>,
				container
			);
		});
	}
	changeCallback(callback){
		$(document).ready(() => {
			var container = document.getElementById(this.id);
			render(
				<Kifu callback={callback} ImageDirectoryPath={KifuController.settings.ImageDirectoryPath}/>,
				container
			);
		});
	}
	static loadCallback(callback, id){
		var controller = new KifuController(id);
		controller.changeCallback(callback);
		return controller;
	}
	static loadString(kifu, id){
		var controller = new KifuController(id);
		controller.loadKifu(kifu);
		return controller;
	}
	static load(filename, id){
		KifuController.loadCallback(done => {
			ajax(filename, (data, err) => {
				if(err){
					this.logError(err);
					return;
				}
				done(data, filename);
			});
		}, id);
	}
}

KifuController.settings = {};

function ajax(filename, onSuccess){
	var encoding = getEncodingFromFileName(filename);
	$.ajax(filename, {
		success: function(data, textStatus){
			if(textStatus=="notmodified"){
				return;
			}
			onSuccess(data);
		},
		error: function(jqXHR, textStatus, errorThrown){
			if(textStatus!="notmodified"){
				var message = "棋譜の取得に失敗しました: "+filename;
				if(document.location.protocol=="file:"){
					message+="\n\n【備考】\nAjaxのセキュリティ制約により，ローカルの棋譜の読み込みが制限されている可能性があります．\nサーバ上にアップロードして動作をご確認下さい．\nもしくは，棋譜ファイルのドラッグ&ドロップによる読み込み機能をお試し下さい．";
				}
				onSuccess(null, message);
			}
		},
		beforeSend: function(xhr){
			xhr.overrideMimeType("text/html;charset="+encoding);
		},
		ifModified: true,
	});
}
