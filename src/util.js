import {Color} from "shogi.js";

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

// ファイルオブジェクトと読み込み完了後のコールバック関数を渡す
// 読み込み完了後，callback(ファイル内容, ファイル名)を呼ぶ
export function loadFile(file, callback){
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

export function ajax(filename, onSuccess){
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

export const version = "1.2.0";
