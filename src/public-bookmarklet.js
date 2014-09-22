(function() {
	function start() {
		Kifu.settings.ImageDirectoryPath = "https://na2hiro.github.io/Kifu-for-JS/images";
		var target = $("#KifuR");
		console.log($.jquery, target.toString(), target.length);
		var targetId, kifuPath;
		if(target.length>0){
			target.replaceWith("<div id='KifuR'></div>");
			targetId="KifuR";
			kifuPath = so.variables.kifu.replace(/\.Z$/g, "");
		}
		if(!targetId){
			alert("棋譜が見つかりませんでした");
			return;
		}
		console.log("load start");
		Kifu.load(kifuPath, targetId);
    }
	var cnt=0;
	if(!$ || !$.fn || !$.fn.jquery){
		cnt++;
		var scr = document.createElement("script");
		scr.src = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
		scr.charset="utf-8";
		scr.onload = function() {
			console.log("jq loaded");
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
