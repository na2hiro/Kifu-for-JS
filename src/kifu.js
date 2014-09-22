/// <reference path="../json-kifu-format/src/player.ts" />
/// <reference path="../json-kifu-format/src/normalizer.ts" />
/// <reference path="../DefinitelyTyped/jquery/jquery.d.ts" />
var Kifu = (function () {
    function Kifu(id) {
        this.id = id;
        this.id = "#" + this.id;
    }
    Kifu.load = function (filename, id) {
        if (!id) {
            id = "kifuforjs_" + Math.random().toString(36).slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        var player = new Kifu(id);
        player.prepareDOM();
        $(document).ready(function () {
            $.ajax(filename, {
                success: function (data) {
                    player.initialize(JKFPlayer.parseKIF(data));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("棋譜読み込みに失敗しました: " + textStatus);
                },
                beforeSend: function (xhr) {
                    xhr.overrideMimeType("text/html;charset=Shift_JIS");
                }
            });
        });
        return player;
    };

    Kifu.prototype.initialize = function (player) {
        this.player = player;
        this.show();
    };
    Kifu.prototype.prepareDOM = function (show) {
        if (typeof show === "undefined") { show = false; }
        var _this = this;
        $(function () {
            $(_this.id).append('<table class="kifuforjs">\
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
            _this.kifulist = $("select.kifulist", _this.id);
            _this.kifulist.change(function () {
                _this.goto($(_this).val());
                _this.refresh();
            });
            $("ul.go", _this.id).on("click", "button", function () {
                _this.go($(_this).attr("data-go"));
                _this.refresh();
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
            $("ul.go form", _this.id).submit(function () {
                _this.goto($("input", _this).val());
                _this.refresh();
                return false;
            });
            if (show)
                _this.show();
        });
    };

    //棋譜の読み込み後に吐き出す
    Kifu.prototype.show = function () {
        var _this = this;
        //		var append =[{x:"prependTo", y:"appendTo"}, {x:"appendTo", y:"appendTo"}];
        //盤面用意
        var tbody = $("table.ban tbody", this.id);
        tbody.children().remove();
        var tr = $("<tr><th></th></tr>").appendTo(tbody);
        this.tds = [];
        for (var i = 1; i <= 9; i++) {
            this.tds.push([]);

            //			$("<th>"+i+"</th>")[append[0].x](tr);
            $("<th>" + i + "</th>").prependTo(tr);
        }
        for (var j = 1; j <= 9; j++) {
            //			var tr = $("<tr></tr>")[append[0].y](tbody);
            var tr = $("<tr></tr>").appendTo(tbody);
            $("<th>" + Kifu.numToKanji(j) + "</th>").appendTo(tr);
            for (var i = 1; i <= 9; i++) {
                //				this.tds[i-1][j-1]=$("<td><img></td>")[append[0].x](tr);
                this.tds[i - 1][j - 1] = $("<td><img></td>").prependTo(tr);
            }
        }

        //棋譜用意
        var kifulist = $("select.kifulist", this.id);
        kifulist.children().remove();
        this.player.kifu.moves.forEach(function (obj, tesuu) {
            $("<option value='" + tesuu + "'>" + tesuu + ": " + _this.player.getReadableKifu(tesuu) + (_this.player.getComments(tesuu).length > 0 ? "*" : "") + "</option>").appendTo(kifulist);
            i++;
        });

        var data = this.player.kifu.header;
        var dl = $("<dl></dl>");
        for (var key in data) {
            switch (key) {
                case "先手":
                case "後手":
                    this.setPlayer(key == "先手" ? 0 : 1, data[key]);

                default:
                    dl.append($("<dt></dt>").text(key));
                    dl.append($("<dd></dd>").text(data[key]));
            }
        }
        var dom = $("div.info", this.id);
        dom.children().remove();
        dom.append(dl);

        this.refresh();
    };

    //盤面を再生した後に吐き出す
    Kifu.prototype.refresh = function () {
        for (var i = 1; i <= 9; i++) {
            for (var j = 1; j <= 9; j++) {
                this.setPiece(i, j, this.player.getBoard(i, j));
            }
        }

        for (var direction = 0; direction <= 1; direction++) {
            this.getHandDom(direction).children().remove();
            for (var color = 0 /* Black */; color <= 1 /* White */; color++) {
                var obj = this.player.getHandsSummary(color);
                for (var kind in obj) {
                    this.setHand(color, kind, obj[kind]);
                }
            }
        }

        //手数描画
        $("ul.go form input", this.id).val(this.player.tesuu.toString());
        try  {
            $("select.kifulist option", this.id)[this.player.tesuu].selected = true;
        } catch (e) {
        }
        ;

        //コメント描画
        $("textarea.comment", this.id).val(this.player.getComments());
    };
    Kifu.prototype.setPiece = function (x, y, piece) {
        var dom = $("img", this.tds[x - 1][y - 1]);
        var src = this.getPieceImageByPiece(piece);
        if (dom.attr("src") != src) {
            dom.attr("src", src);
        }
    };
    Kifu.prototype.getHandDom = function (direction) {
        return $("div.mochi.mochi" + direction + " div.mochimain", this.id);
    };
    Kifu.prototype.setHand = function (color, kind, value) {
        var span = $("<span class='mochigoma'></span>");
        span.append("<img src='" + this.getPieceImage(kind, color) + "'>");
        if (value > 1) {
            span.append("<span class='maisuu'>" + Kifu.numToKanji(value) + "</span>");
        }
        span.appendTo(this.getHandDom(color));
    };
    Kifu.prototype.getPieceImageByPiece = function (piece) {
        return piece ? this.getPieceImage(piece.kind, piece.color) : this.getPieceImage(null, null);
    };
    Kifu.prototype.getPieceImage = function (kind, color) {
        return "../images/" + (!kind ? "___" : color + kind) + ".png";
    };
    Kifu.prototype.goto = function (tesuu) {
        if (isNaN(tesuu))
            return;
        this.player.goto(tesuu);
        //		this.onMoveCallback(this.shogi.tesuu);
    };
    Kifu.prototype.go = function (tesuu) {
        if (tesuu == "start") {
            this.player.goto(0);
        } else if (tesuu == "end") {
            this.player.goto(Infinity);
        } else {
            tesuu = parseInt(tesuu);
            if (isNaN(tesuu))
                return;
            this.player.go(tesuu);
        }
        //		this.onMoveCallback(this.shogi.tesuu);
    };
    Kifu.prototype.setPlayer = function (color, name) {
        $("div.mochi.mochi" + color + " .tebanname", this.id).text(Kifu.colorToMark(color) + name);
    };

    /*	onMove(callback){
    this.onMoveCallback = callback;
    }*/
    Kifu.numToKanji = function (n) {
        return "〇一二三四五六七八九"[n];
    };
    Kifu.colorToMark = function (color) {
        return color == 0 /* Black */ ? "☗" : "☖";
    };
    return Kifu;
})();
