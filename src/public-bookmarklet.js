(function() {
	function start() {
		try{
			Kifu.settings.ImageDirectoryPath = "https://na2hiro.github.io/Kifu-for-JS/images";
			var target = $("#flashcontent");
			var targetId, kifuPath;
			if(target.length>0){
				target.replaceWith("<div id='flashcontent'></div>");
				targetId="flashcontent";
				kifuPath = so.variables.kifu.replace(/\.Z$/g, "");
			}
			if(!targetId) throw "棋譜が見つかりませんでした";
			console.log("load start");
			try{
				Kifu.load(kifuPath, targetId);
			}catch(e){
				throw "棋譜解析エラー"+e;
			}
		}catch(e){
			console.log(e);
			alert("読込失敗: "+e);
		}
	}
	var cnt=0;
	if(typeof $=="undefined" || !$.fn || !$.fn.jquery){
		cnt++;
		var scr = document.createElement("script");
		scr.src = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
		scr.charset="utf-8";
		scr.onload = function() {
			console.log("jq loaded");
			$=jQuery;
			if(--cnt==0) start();
		};
		document.body.appendChild(scr);
	}
	cnt++;
	var scr = document.createElement("script");
	scr.src = "https://na2hiro.github.io/Kifu-for-JS/src/kifuforjs.js";
	scr.charset="utf-8";
	scr.onload = function(){
		console.log("Kifu for JS loaded");
		if(--cnt==0) start();
	};
	document.body.appendChild(scr);
	var link = document.createElement('link');
	link.type='text/css';
	link.href='https://na2hiro.github.io/Kifu-for-JS/css/kifuforjs.css';
	link.rel='stylesheet';
	document.getElementsByTagName('head')[0].appendChild(link);
})();
