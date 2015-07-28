/// <reference path="../src/JSONKifuFormat.d.ts" />
/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import ShogiJS = require("../node_modules/shogi.js/lib/shogi");
import Color = ShogiJS.Color;
export declare function canPromote(place: PlaceFormat, color: Color): boolean;
export declare function normalizeMinimal(obj: JSONKifuFormat): JSONKifuFormat;
export declare function normalizeKIF(obj: JSONKifuFormat): JSONKifuFormat;
export declare function normalizeKI2(obj: JSONKifuFormat): JSONKifuFormat;
export declare function normalizeCSA(obj: JSONKifuFormat): JSONKifuFormat;
