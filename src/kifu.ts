/// <reference path="../json-kifu-format/src/player.ts" />
/// <reference path="../json-kifu-format/src/normalizer.ts" />
/// <reference path="../DefinitelyTyped/jquery/jquery.d.ts" />

/** @license
 * Kifu for JS
 * Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

class Kifu{
	static version = "1.0.5";
	static settings = {};
	static load(filename: string, id?: string){
		if(!id){
			id = "kifuforjs_"+Math.random().toString(36).slice(2);
			document.write("<div id='"+id+"'></div>");
		}
		var kifu = new Kifu(id);
		kifu.prepareDOM();
		$(document).ready(()=>{
			Kifu.ajax(filename, (data)=>{
				kifu.filename = filename;
				kifu.initialize(JKFPlayer.parse(data, filename));
			});
		});
		return kifu;
	}
	static ajax(filename, onSuccess){
		var tmp = filename.split("."), ext = tmp[tmp.length-1];
		var encoding = ["jkf", "kifu", "ki2u"].indexOf(ext)>=0 ? "UTF-8" : "Shift_JIS";
		$.ajax(filename, {
			success: (data, textStatus)=>{
				if(textStatus=="notmodified"){
					console.log("kifu not modified");
					return;
				}
				onSuccess(data);
			},
			error: (jqXHR, textStatus, errorThrown)=>{
				if(textStatus!="notmodified"){
					alert("棋譜読み込みに失敗しました: "+textStatus);
				}
			},
			beforeSend: (xhr)=>{
				xhr.overrideMimeType("text/html;charset="+encoding);
			},
			ifModified: true,
		});
	}

	kifulist;
	forklist;
	public player: JKFPlayer;
	tds: JQuery[][];
	lastTo: {x: number; y: number;} = null;
	lastForkDepth = 0;
	filename: string;
	timerAutoload: number;
	constructor(public id: string){
		this.id="#"+this.id;
	}
	initialize(player: JKFPlayer){
		this.player = player;
		this.show();
	}
	prepareDOM(show = false){
		$(()=>{
			$(this.id).append('<table class="kifuforjs">\
			<tbody>\
				<tr>\
					<td>\
						<div class="inlineblock players">\
							<div class="mochi mochi1">\
								<div class="tebanname">☖</div>\
								<div class="mochimain"></div>\
							</div>\
							<div class="mochi">\
								<select class="kifulist" size="7"></select>\
								<ul class="lines">\
									<li class="fork">\
										<select class="forklist">\
											<option value="0">変化なし\
										</select>\
									</li>\
									<li><button class="dl">棋譜保存</button>\
									<li>\
										<select class="autoload">\
											<option value="0">自動更新しない\
											<option value="30">自動更新30秒毎\
											<option value="60">自動更新1分毎\
											<option value="180">自動更新3分毎\
										</select>\
									</li>\
								</ul>\
							</div>\
						</div>\
					</td>\
					<td style="text-align:center">\
						<table class="ban">\
							<tbody>\
							</tbody>\
						</table>\
					</td>\
					<td>\
						<div class="inlineblock players">\
							<div class="mochi info">\
							</div>\
							<div class="mochi mochi0">\
								<div class="tebanname">☗</div>\
								<div class="mochimain"></div>\
							</div>\
						</div>\
					</td>\
				</tr>\
				<tr>\
					<td colspan=3 style="text-align:center">\
						<ul class="inline go" style="margin:0 auto;">\
							<li><button data-go="start">|&lt;</button></li>\
							<li><button data-go="-10">&lt;&lt;</button></li>\
							<li><button data-go="-1">&lt;</button></li>\
							<li>\
								<form action="?" style="display:inline">\
									<input type="text" name="tesuu" size="3" style="text-align:center">\
								</form>\
							</li>\
							<li><button data-go="1">&gt;</button></li>\
							<li><button data-go="10">&gt;&gt;</button></li>\
							<li><button data-go="end">&gt;|</button></li>\
						</ul>\
						<ul class="inline">\
							<li><button class="credit">credit</button>\
						</ul>\
'+/*						<ul class="inline panel" style="margin:0 auto;">\
							<li><button class="dl" data-type="json">JSON</button></li>\
							<li><button class="dl" data-type="kif">KIF</button></li>\
						</ul>*/'\
						<textarea rows="10" class="comment" disabled></textarea>\
					</td>\
				</tr>\
			</tbody>\
		</table>');
			/*
			document.body.addEventListener("drop", (e)=>{
				e.preventDefault();
				console.log(e)
				
                var reader = new FileReader();
                reader.onload = (e)=> {
                    //alert(e.target.result);
                    shogi.loadKif(e.target.result)
                    shogitter.show()
                };
                reader.readAsText(e.dataTransfer.files[0],"SJIS");
			});
			*/

			for(var c=Color.Black; c<=Color.White; c++){
				var handDom = $("div.mochi.mochi"+c+" div.mochimain", this.id);
				["FU","KY","KE","GI","KI","KA","HI"].forEach((kind)=>{
					var span = $("<span class='mochigoma mochi_"+kind+" mai0'></span>");
					span.data("value", 0);
					span.append("<img src='"+this.getPieceImage(kind, c)+"'>");
					span.append("<span class='maisuu'></span>");
					span.appendTo(handDom);
				});
			}
		
			this.kifulist = $("select.kifulist", this.id);
			var that = this;
			this.kifulist.change(function(){
				that.goto($(this).val());
				that.refresh();
			});
			this.forklist = $("select.forklist", this.id);
			this.forklist.change(function(){
				that.forkAndForward(parseInt($(this).val()));
				that.refresh();
			});
			$("ul.go", this.id).on("click", "button", function(){
				that.go($(this).attr("data-go"));
				that.refresh();
			});
			$("select.autoload", this.id).change(function(){
				if(that.timerAutoload){
					clearInterval(that.timerAutoload);
				}
				var s = parseInt($(this).val());
				if(!isNaN(s) && s>0){
					that.timerAutoload = setInterval(()=>{
						that.reload();
					}, s*1000);
				}
			});
			$("button.dl", this.id).on("click", ()=>{
				if(this.filename){
					window.open(this.filename);
				}
			});
			$("button.credit", this.id).on("click", ()=>{
				if(confirm("*** CREDIT ***\nKifu for JS (ver. "+Kifu.version+")\n    by na2hiro\n    under the MIT License\n\n公式サイトを開きますか？")){
					window.open("https://github.com/na2hiro/Kifu-for-JS", "kifufile");
				}
			});
			/*
			$("ul.panel", this.id).on("click", "button.dl", ()=>{
				var str;
				switch($(this).attr("data-type")){
					case "json":
						str=shogi.toJSON();
						break;
					case "kif":
						str=shogi.toKIF();
						break;
					default:
						throw "未対応";
				}
				$("textarea.comment", this.id).val(str);
			});
			*/
			$("ul.go form", this.id).submit(function(){
				that.goto($("input", this).val());
				that.refresh();
				return false;
			});
			if(show) this.show();
		});
	}
	showKifuList(){
		var forkFlag = false;
		var children = this.kifulist.children();
		var max = this.player.getMaxTesuu();
		for(var tesuu=0; tesuu<=max; tesuu++){
			var elem;
			if(children[tesuu]){
				elem = $(children[tesuu]);
			}else{
				elem = $("<option>").val(tesuu.toString());
				elem.appendTo(this.kifulist);
			}
			var forks = this.player.getReadableForkKifu(tesuu-1);
			if(forks.length>0) forkFlag=true;
			elem.text((this.player.getComments(tesuu).length>0?"*":"\xa0")+Kifu.pad(tesuu.toString(),"\xa0", 3)+" "+this.player.getReadableKifu(tesuu)+" "+forks.join(" "));
		}
		for(var tesuu=<number>children.length-1; tesuu>max; tesuu--){
			children[tesuu].remove();
		}
		if(forkFlag){
			$("div.players", this.id).addClass("withfork");
		}else{
			$("div.players", this.id).removeClass("withfork");
		}
	}
	//棋譜の読み込み後に吐き出す
	show(){
//		var append =[{x:"prependTo", y:"appendTo"}, {x:"appendTo", y:"appendTo"}];
		
		//盤面用意
		var tbody = $("table.ban tbody", this.id);
		tbody.children().remove();
		var tr= $("<tr><th></th></tr>").appendTo(tbody);
		this.tds=[];
		for(var i=1; i<=9; i++){
			this.tds.push([]);
//			$("<th>"+i+"</th>")[append[0].x](tr);
			$("<th>"+i+"</th>").prependTo(tr);
		}
		for(var j=1; j<=9; j++){
//			var tr = $("<tr></tr>")[append[0].y](tbody);
			var tr = $("<tr></tr>").appendTo(tbody);
			$("<th>"+Kifu.numToKanji(j)+"</th>").appendTo(tr);
			for(var i=1; i<=9; i++){
//				this.tds[i-1][j-1]=$("<td><img></td>")[append[0].x](tr);
				this.tds[i-1][j-1]=$("<td><img></td>").prependTo(tr);
			}
		}
		
		this.showKifuList();
		
		
		var data = this.player.kifu.header;
		var dl = $("<dl></dl>");
		for(var key in data){
			switch(key){
				case "先手":
				case "後手":
				case "上手":
				case "下手":
					this.setPlayer("先下".indexOf(key[0])>=0?0:1, data[key]);
/*
					break;

				case "結果":
					var text = (data[key]=="先手"||data[key]=="後手"?data[key]+"の"+(data["理由"]||"")+"勝ち":data[key]);
					$("select.kifulist").append("<option value='99999'>"+text+"</option>")
					dl.append($("<dt></dt>").text("結果"));
					dl.append($("<dd></dd>").text(text));
					break;
				case "date":
					if(data.date.start){
						dl.append($("<dt>開始日時</dt>"));
						var date = new Date(data.date.start);
						dl.append($("<dd></dd>").text((new DateFormat("yyyy-MM-dd HH:mm")).format(date)));
					}
					if(data.date.end){
						dl.append($("<dt>終了日時</dt>"));
						var date = new Date(data.date.end);
						dl.append($("<dd></dd>").text((new DateFormat("yyyy-MM-dd HH:mm")).format(date)));
					}
					break;
				case "tesuu":
					dl.append($("<dt></dt>").text("手数"));
					dl.append($("<dd></dd>").text(data[key]));
					break;
				case "理由":
					break;*/
				default:
					dl.append($("<dt></dt>").text(key));
					dl.append($("<dd></dd>").text(data[key]));
			}
		}
		var dom = $("div.info", this.id);
		dom.children().remove();
		dom.append(dl);

		this.refresh();
	}
	//盤面を再生した後に吐き出す
	refresh(){
		//盤面描画
		for(var i=1; i<=9; i++){
			for(var j=1; j<=9; j++){
				this.setPiece(i, j, this.player.getBoard(i, j));
			}
		}
		//持ち駒描画
		for(var color=Color.Black; color<=Color.White; color++){
			var obj = this.player.getHandsSummary(color);
			for(var kind in obj){
				this.setHand(color, kind, obj[kind]);
			}
		}
		
		//手数描画
		$("ul.go form input", this.id).val(this.player.tesuu.toString());
		try{(<HTMLOptionElement>$("select.kifulist option", this.id)[this.player.tesuu]).selected=true}catch(e){};
		//最終手描画戻す
		if(this.lastTo){
			this.tds[this.lastTo.x-1][this.lastTo.y-1].removeClass("lastto");
			this.lastTo=null;
		}

		var nowComments = this.player.getComments();
		var nowMove = this.player.getMove();
		if(this.player.tesuu==this.player.getMaxTesuu()){
			//最終手に動きがない(≒specialである)場合は直前の一手を採用
			if(nowComments.length==0) nowComments = this.player.getComments(this.player.tesuu-1);
			if(!nowMove) nowMove = this.player.getMove(this.player.tesuu-1);
		}
		//コメント描画
		$("textarea.comment", this.id).val(nowComments.join("\n"));

		//最終手描画
		if(nowMove && nowMove.to){
			this.lastTo = nowMove.to;
			this.tds[this.lastTo.x-1][this.lastTo.y-1].addClass("lastto");
		}
		// 分岐
		var forks = this.player.getReadableForkKifu();
		this.forklist.empty();
		if(forks.length>0){
			this.forklist.attr("disabled", false);
			this.forklist.append($("<option>").val("NaN").text(this.player.getReadableKifu(this.player.tesuu+1)));
			forks.forEach((fork, i)=>{
				this.forklist.append($("<option>").val(i.toString()).text(fork));
			});
		}else{
			this.forklist.attr("disabled", true);
			this.forklist.append($("<option>").text("変化なし"));
		}
		if(this.lastForkDepth != this.player.forks.length){
			this.lastForkDepth = this.player.forks.length;
			this.showKifuList();
		}
	}
	setPiece(x: number, y: number, piece: Piece){
		var dom = $("img", this.tds[x-1][y-1]);
		var src = this.getPieceImageByPiece(piece);
		if(dom.attr("src")!=src){
			dom.attr("src",src);
		}
	}
	getHandDom(color: Color, kind: string){
		return $("div.mochi.mochi"+color+" div.mochimain span.mochigoma.mochi_"+kind, this.id);
	}
	setHand(color: Color, kind: string, value: number){
		var dom = this.getHandDom(color, kind);
		var val = dom.data("value");
		if(val == value) return;
		dom.data("value", value);
		if(value<2){
			dom.removeClass("mai"+(1-value));
			dom.addClass("mai"+value);
		}else{
			$("span.maisuu", dom).text(Kifu.numToKanji(value));
			dom.removeClass("mai0 mai1");
		}
	}
	getPieceImageByPiece(piece: Piece){
		return piece
				? this.getPieceImage(piece.kind, piece.color)
				: this.getPieceImage(null, null);
	}
	getPieceImage(kind: string, color: Color){
		return Kifu.settings["ImageDirectoryPath"]+"/"+(!kind?"blank":color+kind)+".png";
	}
	forkAndForward(num: number){
		this.player.forkAndForward(num);
	}
	goto(tesuu){
		if(isNaN(tesuu)) return;
		this.player.goto(tesuu);
	}
	go(tesuu){
		if(tesuu=="start"){
			this.player.goto(0);
		}else if(tesuu=="end"){
			this.player.goto(Infinity);
		}else{
			tesuu = parseInt(tesuu);
			if(isNaN(tesuu)) return;
			this.player.go(tesuu);
		}
	}
	setPlayer(color, name){
		$("div.mochi.mochi"+color+" .tebanname", this.id).text(Kifu.colorToMark(color)+name);
	}
	reload(){
		Kifu.ajax(this.filename, (data)=>{
			JKFPlayer.log("reload");
			var tesuu = this.player.tesuu == this.player.getMaxTesuu() ? Infinity : this.player.tesuu;
			var player = JKFPlayer.parse(data, this.filename);
			player.goto(tesuu);
			this.initialize(player);
		});
	}

	static numToKanji(n: number): string{
		return "〇一二三四五六七八九"[n];
	}
	static colorToMark(color: Color): string{
		return color==Color.Black ? "☗" : "☖";
	}
	// length <= 10
	static pad(str: string, space: string, length: number){
		var ret = "";
		for(var i=str.length; i<length; i++){
			ret+=space;
		}
		return ret+str;
	}
}
