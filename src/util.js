import {Color} from "json-kifu-format/node_modules/shogi.js";

export function colorToMark(color){
    return color==Color.Black ? "☗" : "☖";
}
// length <= 10
export function pad(str, space, length){
    var ret = "";
    for(var i=str.length; i<length; i++){
        ret+=space;
    }
    return ret+str;
}

export const version = "1.1.5";
