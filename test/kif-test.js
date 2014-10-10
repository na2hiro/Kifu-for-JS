var JKFPlayer = require("../src/kifuplayer");
var fs = require('fs');
var iconv = new (require("iconv").Iconv)("cp932", "utf-8");
var dir = __dirname+'/files/kif/';
var files = fs.readdirSync(dir).filter(function(file){
	return fs.statSync(dir+file).isFile() && /.*\.kifu?$/.test(file);
});
var ok=0, ng=0, ngs=[];
files.forEach(function(file){
	var f = fs.readFileSync(dir+file);
	var kifu = /.*\.kifu$/.test(file) ? f.toString().replace(/^\ufeff/, "") : iconv.convert(f).toString();
	console.log(file, ",", kifu.charCodeAt(0));
	try{
		JKFPlayer.parseKIF(kifu);
		ok++;
	}catch(e){
		console.log("failed", file, ": ", e);
		ng++;
	}
});
console.log("ok", ok, "ng", ng);

