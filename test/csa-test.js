var JKFPlayer = require("../src/kifuplayer");
var fs = require('fs');
var iconvs = ["cp932", "EUC-JISX0213"].map(function(enc){return new (require("iconv").Iconv)(enc, "utf-8")});

var dir = __dirname+'/files/csa/';
var files = fs.readdirSync(dir).filter(function(file){
	return fs.statSync(dir+file).isFile() && /.*\.csa$/.test(dir+file);
});
var ok=0, ng=0, ngs=[];
files.forEach(function(file){
	var f = fs.readFileSync(dir+file);
	var kifu;
	for(var i=0; i<iconvs.length; i++){
		try{
			kifu = iconvs[i].convert(f).toString();
			break;
		}catch(e){
		
		}
	}
	try{
		JKFPlayer.parseCSA(kifu);
		ok++;
	}catch(e){
		console.log("failed", file, ": ", e);
		ng++;
	}
});
console.log("ok", ok, "ng", ng);

