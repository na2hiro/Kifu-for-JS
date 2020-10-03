/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import { autorun, reaction, when } from "mobx";
import KifuStore from "./stores/KifuStore";
export declare const mobx: {
    autorun: typeof autorun;
    when: typeof when;
    reaction: typeof reaction;
};
export declare function loadString(kifu: string, id?: string): Promise<KifuStore>;
export declare function load(filePath: string, id?: string): Promise<KifuStore>;
