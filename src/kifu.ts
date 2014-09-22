/// <reference path="../json-kifu-format/src/player.ts" />
/// <reference path="../json-kifu-format/src/normalizer.ts" />
/// <reference path="../DefinitelyTyped/jquery/jquery.d.ts" />

class Kifu{
	static kifus: Kifu[];
	static load(filename: string, id?: string){
		if(!id){
			id = "kifuforjs_"+Math.random().toString(36).slice(2);
			document.write("<div id='"+id+"'></div>");
		}
		var player = new Kifu(id);
		$(document).ready(function() {
			$.ajax(filename, {
				success: function(data) {
					player.initialize(new JKFPlayer(data));
				},
				beforeSend: function(xhr){
					xhr.overrideMimeType("text/html;charset=Shift_JIS");
				},
			});
		});
		return player;
	}

	kifulist;
	public player: JKFPlayer;
	tds: JQuery[][];
	constructor(public id: string){
	}
	initialize(player: JKFPlayer){
		this.player = player;
	}
	makeDOM(show){
		$(()=>{
			$(this.id).append('<table class="kifuforjs">\
			<tbody>\
				<tr>\
					<td>\
						<div class="inlineblock players">\
							<div class="mochi teban mochi1">\
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
						<ul class="inline panel" style="margin:0 auto;">\
							<li><button class="dl" data-type="json">JSON</button></li>\
							<li><button class="dl" data-type="kif">KIF</button></li>\
						</ul>\
						<textarea style="width:100%" rows=10 class="comment"></textarea>\
					</td>\
				</tr>\
			</tbody>\
		</table>');
			/*
			document.body.addEventListener("drop", function(e){
				e.preventDefault();
				console.log(e)
				
                var reader = new FileReader();
                reader.onload = function(e) {
                    //alert(e.target.result);
                    shogi.loadKif(e.target.result)
                    shogitter.show()
                };
                reader.readAsText(e.dataTransfer.files[0],"SJIS");
			});
			*/
		
			this.kifulist = $("select.kifulist", this.id);
			this.kifulist.change(function(){
				this.goto($(this).val());
				this.refresh();
			});
			$("ul.go", this.id).on("click", "button", function(){
				this.go($(this).attr("data-go"));
				this.refresh();
			});
			/*
			$("ul.panel", this.id).on("click", "button.dl", function(){
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
				this.goto($("input", this).val());
				this.refresh();
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
		i=0;
		kifulist.children().remove();
		this.player.kifu.moves.forEach(function(obj){
			$("<option value='"+i+"'>"+i+": "+(this.shogi.kifu.getReadable(i)||"初期局面")+(this.shogi.kifu.existsComment(i)?"*":"")+"</option>").appendTo(kifulist);
			i++;
		}.bind(this));
		
		
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
		for(var direction=0; direction<=1; direction++){
			this.getHandDom(direction).children().remove();
			for(var color=Color.Black; color<=Color.White; color++){
				var obj = this.player.getHandsSummary(color);
				for(var kind in obj){
					this.setHand(color, kind, obj[kind]);
				}
			}
		}
		
		//手数描画
		$("ul.go form input", this.id).val(this.player.tesuu.toString());
		try{(<HTMLOptionElement>$("select.kifulist option", this.id)[this.player.tesuu]).selected=true}catch(e){};
		//コメント描画
		$("textarea.comment", this.id).val(this.player.getNowComments());
	}
	setPiece(x: number, y: number, piece: Piece){
		var dom = $("img", this.tds[x-1][y-1]);
		var src = this.getPieceImageByPiece(piece);
		if(dom.attr("src")!=src){
			dom.attr("src",src);
		}
	}
	getHandDom(direction){
		return $("div.mochi.mochi"+direction+" div.mochimain", this.id);
	}
	setHand(color: Color, kind: string, value: number){
		var span = $("<span class='mochigoma'></span>");
		span.append("<img src='"+this.getPieceImage(kind, color)+"'>");
		if(value>1){
			span.append("<span class='maisuu'>"+Kifu.numToKanji(value)+"</span>");
		}
		span.appendTo(this.getHandDom(color));
		console.log(span);					
	}
	getPieceImageByPiece(piece: Piece){
		return piece
				? this.getPieceImage(piece.kind, piece.color)
				: this.getPieceImage(null, null);
	}
	getPieceImage(kind: string, color: Color){
		return "rule/hirate/"+(!kind?"___":color+kind)+".png";
	}
	goto(tesuu){
		if(isNaN(tesuu)) return;
		this.player.goto(tesuu);
//		this.onMoveCallback(this.shogi.tesuu);
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
//		this.onMoveCallback(this.shogi.tesuu);
	}
	setPlayer(color, name){
		$("div.mochi.mochi"+color+" .tebanname", this.id).text(Kifu.colorToMark(color)+name);
	}
/*	onMove(callback){
		this.onMoveCallback = callback;
	}*/

	static numToKanji(n: number): string{
		return "〇一二三四五六七八九"[n];
	}
	static colorToMark(color: Color): string{
		return color==Color.Black ? "☗" : "☖";
	}
}
