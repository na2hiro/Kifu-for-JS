/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import Kifu from "./Kifu.js";
import React from "react";
import {render} from "react-dom";
import {ajax} from "./util.js";

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

