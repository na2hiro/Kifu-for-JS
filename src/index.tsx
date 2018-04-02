/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
declare var $; // jQuery

import * as React from "react";
import { render } from "react-dom";
import Kifu from "./Kifu";
import { ajax } from "./util";

export function loadCallback(callback, id): KifuController {
    const controller = new KifuController(id);
    controller.changeCallback(callback);
    return controller;
}
export function loadString(kifu, id): KifuController {
    const controller = new KifuController(id);
    controller.loadKifu(kifu);
    return controller;
}
export function load(filename, id) {
    loadCallback((done) => {
        ajax(filename, (data, err) => {
            if (err) {
                this.logError(err);
                return;
            }
            done(data, filename);
        });
    }, id);
}

export class KifuController {
    private id: string;
    constructor(id) {
        if (!id) {
            id =
                "kifuforjs_" +
                Math.random()
                    .toString(36)
                    .slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        this.id = id;
    }
    public loadKifu(kifu) {
        $(document).ready(() => {
            const container = document.getElementById(this.id);
            render(<Kifu kifu={kifu} />, container);
        });
    }
    public changeCallback(callback) {
        $(document).ready(() => {
            const container = document.getElementById(this.id);
            render(<Kifu callback={callback} />, container);
        });
    }
}

export let settings = {};
