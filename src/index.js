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

export function loadCallback(callback, id){
    var controller = new KifuController(id);
    controller.changeCallback(callback);
    return controller;
}
export function loadString(kifu, id){
    var controller = new KifuController(id);
    controller.loadKifu(kifu);
    return controller;
}
export function load(filename, id){
    loadCallback(done => {
        ajax(filename, (data, err) => {
            if(err){
                this.logError(err);
                return;
            }
            done(data, filename);
        });
    }, id);
}

class KifuController{
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
            console.log("settings", settings);
			render(
				<Kifu kifu={kifu} ImageDirectoryPath={settings.ImageDirectoryPath}/>,
				container
			);
		});
	}
	changeCallback(callback){
		$(document).ready(() => {
			var container = document.getElementById(this.id);
			render(
				<Kifu callback={callback} ImageDirectoryPath={settings.ImageDirectoryPath}/>,
				container
			);
		});
	}
}

export var settings = {
	ImageDirectoryPath: "../images" // TODO This cannot be modified
};

