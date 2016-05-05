/** @license
 * JSON Kifu Format
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
import ShogiJS = require("shogi.js/lib/shogi");
import Color = ShogiJS.Color;
import JKF = require('./JSONKifuFormat');
export declare function canPromote(place: JKF.PlaceFormat, color: Color): boolean;
export declare function normalizeMinimal(obj: JKF.JSONKifuFormat): JKF.JSONKifuFormat;
export declare function normalizeKIF(obj: JKF.JSONKifuFormat): JKF.JSONKifuFormat;
export declare function normalizeKI2(obj: JKF.JSONKifuFormat): JKF.JSONKifuFormat;
export declare function normalizeCSA(obj: JKF.JSONKifuFormat): JKF.JSONKifuFormat;
