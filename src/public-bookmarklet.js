/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function() {
	function start() {
        if(window.getSelection && getSelection().toString()!=""){
            replaceSelected().catch(fail);
        }else{
            replaceAll().catch(fail);
        }
        function fail(e){
            console.log(e);
            alert("読込失敗: "+e);
        }

        async function replaceAll(){
			var targetList = [];
			$("applet param[name=KIFU]").each(function(index){
				// applet方式
				// homepage2.nifty.com/kakinoki_y/kifujf/example.html
				var $parent = $(this).parent();
				var base = $parent.attr("codebase") || ".";
				var targetId = "kifuforjs_"+makeRandomString();
				var kifuPath = base.replace(/\/$/, "")+"/"+$(this).val();
				$parent.replaceWith("<div id='"+targetId+"'></div>");
				targetList.push({targetId: targetId, kifuPath: kifuPath, method: "applet"})
			});
			$("object param[name=FlashVars]").each(function(index){
				// object方式 http://homepage2.nifty.com/kakinoki_y/flash/example.html
				var $parent = $(this).parent();
				var kifuPath;
				$(this).val().split("&").map(function(kv){
					var s = kv.split("=");
					if(s[0]=="kifu") kifuPath=s[1];
				});
				if(!kifuPath) return;

				var targetId = "kifuforjs_"+makeRandomString();
				$parent.replaceWith("<div id='"+targetId+"'></div>");
				targetList.push({kifuPath: kifuPath, targetId: targetId, method: "object"});
			});

			// SWFObject方式
			// ただしFlashが有効であるなどして上記objectで拾われた場合は対応しない
			if(typeof so != "undefined" && so.variables && so.variables.kifu && $("#flashcontent").length>0){
				// ただしidがflashcontentかつsoオブジェクトが存在する場合のみ)
				// http://homepage2.nifty.com/kakinoki_y/flash/resize.html
				$("#flashcontent").replaceWith("<div id='flashcontent'></div>");
				targetList.push({targetId: "flashcontent", kifuPath: so.variables.kifu, method: "swo_flashcontent"});
			}else if(typeof params!="undefined" && params.FlashVars && $("#so").length>0){
				// ただしidがsoかつparamsオブジェクトがある場合
				// http://mainichi.jp/feature/shougi/ohsho/etc/64/150111.html
				var kifuPath;
				params.FlashVars.split("&").forEach(function(kv){
					var s = kv.split("=");
					if(s[0]=="kifu") kifuPath=s[1];
				});
				if(kifuPath){
					$("#so").replaceWith("<div id='so'></div>");
					$("#so").css("visibility", "visible");
					targetList.push({targetId: "so", kifuPath: kifuPath, method: "swo_so"})
				}
			}else{
				// SWFObject方式(script総なめ)
				// http://kiftwi.net/r/YO1ErcFF
				$("script").filter(function(i, script){
					return script.textContent.indexOf('SWFObject')>=0;
				}).each(function(i, script){
					var kifuMatch = script.textContent.match(/addVariable.+kifu.+"(.+)"/);
					var idMatch = script.textContent.match(/write.+"(.+)"/);
					if(kifuMatch && idMatch){
						targetList.push({kifuPath: kifuMatch[1], targetId: idMatch[1], method: "swo_bruteforce"});
					}
				});
			}

            if(targetList.length==0){
                throw "将棋盤が見つかりませんでした";
            }

            const Kifu = await loadKifuForJS();

            console.log("load start", targetList);
            targetList.forEach(function(target){
                try{
                    console.log("Kifu", Kifu)
                    Kifu.load(target.kifuPath.replace(/\.(z|gz)$/ig, ""), target.targetId);
                }catch(e){
                    console.log("error", e);
                }
            });
        }


        async function replaceSelected(){
            const Kifu = await loadKifuForJS();
            var selection=getSelection();
            var id = makeRandomString();
            $("<div id='"+id+"'>").insertAfter($(selection.focusNode));
            try{
                Kifu.loadString(selection.toString(), id);
            }catch(e){
                //alert("選択された棋譜の形式エラー: "+e);
                console.log(e);
            }
        }
	}
	function makeRandomString(){
		return Math.random().toString(36).slice(2);
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
	if(cnt==0) start(); // いずれも読み込み済み

	async function loadKifuForJS(){
		const Kifu = (await import(/* webpackChunkName: "KifuInBookmarklet" */"./index.js"));
        Kifu.settings.ImageDirectoryPath = "https://na2hiro.github.io/Kifu-for-JS/images";
        return Kifu;
	}
})();

