var JKFPlayer = require("../out/kifuplayer");
var fs = require('fs');
var iconv = new (require("iconv").Iconv)("cp932", "utf-8");
var dir = __dirname+'/files/ki2/';
var files = fs.readdirSync(dir).filter(function(file){
	return fs.statSync(dir+file).isFile() && /.*\.ki2$/.test(dir+file);
});
var ok=0, ng=0, ngs=[];
files.forEach(function(file){
	var f = fs.readFileSync(dir+file);
	var kifu = iconv.convert(f).toString();
	try{
		JKFPlayer.parseKI2(kifu);
		ok++;
	}catch(e){
		console.log("failed", file, ": ", e);
		ng++;
	}
});
console.log("ok", ok, "ng", ng);

