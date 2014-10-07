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
	static version = "1.0.2";
	static settings = {};
	static load(filename: string, id?: string){
		if(!id){
			id = "kifuforjs_"+Math.random().toString(36).slice(2);
			document.write("<div id='"+id+"'></div>");
		}
		var tmp = filename.split("."), ext = tmp[tmp.length-1];
		var kifu = new Kifu(id);
		kifu.prepareDOM();
		$(document).ready(()=>{
			$.ajax(filename, {
				success: (data)=>{
					kifu.filename = filename;
					kifu.initialize(JKFPlayer.parse(data, filename));
				},
				error: (jqXHR, textStatus, errorThrown)=>{
					alert("棋譜読み込みに失敗しました: "+textStatus);
				},
				beforeSend: (xhr)=>{
					xhr.overrideMimeType("text/html;charset="+(ext=="jkf" ? "UTF-8" : "Shift_JIS"));
				},
			});
		});
		return kifu;
	}

	kifulist;
	public player: JKFPlayer;
	tds: JQuery[][];
	lastTo: {x: number; y: number;} = null;
	filename: string;
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
'+/*						<ul class="inline panel" style="margin:0 auto;">\
							<li><button class="dl" data-type="json">JSON</button></li>\
							<li><button class="dl" data-type="kif">KIF</button></li>\
						</ul>*/'\
						<ul class="inline">\
							<li><button class="dl">保存</button>\
							<li><button class="credit">credit</button>\
						</ul>\
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
			$("ul.go", this.id).on("click", "button", function(){
				that.go($(this).attr("data-go"));
				that.refresh();
			});
			$("button.dl", this.id).on("click", ()=>{
				if(this.filename){
					window.open(this.filename, "kifufile");
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
		
		//棋譜用意
		var kifulist = $("select.kifulist", this.id);
		kifulist.children().remove();
		this.player.kifu.moves.forEach((obj, tesuu)=>{
			$("<option value='"+tesuu+"'>"+(this.player.getComments(tesuu).length>0?"*":"&nbsp;")+Kifu.pad(tesuu.toString(),"&nbsp;", 3)+" "+this.player.getReadableKifu(tesuu)+"</option>").appendTo(kifulist);
			i++;
		});
		
		
		var data = this.player.kifu.header;
		var dl = $("<dl></dl>");
		for(var key in data){
			switch(key){
				case "先手":
				case "後手":
					this.setPlayer(key=="先手"?0:1, data[key]);
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
		//コメント描画
		$("textarea.comment", this.id).val(this.player.getComments().join("\n"));
		//最終手描画
		if(this.lastTo){
			this.tds[this.lastTo.x-1][this.lastTo.y-1].removeClass("lastto");
			this.lastTo=null;
		}
		var move = this.player.getMove();
		if(move && move.to){
			this.lastTo = move.to;
			this.tds[this.lastTo.x-1][this.lastTo.y-1].addClass("lastto");
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
