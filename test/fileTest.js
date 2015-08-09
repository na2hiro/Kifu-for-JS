var assert = require("assert");
jschardet = require("jschardet");
var Iconv = require("iconv").Iconv;
var sjisIconv = new Iconv("cp932", "utf-8");
var fs = require("fs");
var JKFPlayer = require("../lib/jkfplayer");
makeTest("kif", function(filename){return filename.match(/u$/) ? loadUTF : loadSJIS});
makeTest("ki2", function(filename){return filename.match(/u$/) ? loadUTF : loadSJIS});
makeTest("csa", function(filename){return loadAuto});
makeTest("jkf", function(filename){return loadUTF});

function makeTest(ext, fileNameToLoadFunc){
	var datas = {};
	describe(ext+" file", function(){
		var files = fs.readdirSync(__dirname+"/files/"+ext);
		for(var i=0; i<files.length; i++){
			(function(filename){
				if(!filename.match(new RegExp("\\."+ext+"u?$"))) return;
				it(filename, function(done){
					try{
						fileNameToLoadFunc(filename)(__dirname+"/files/"+ext+"/"+filename, function(err, data){
							if(err){
								done(err);
								return;
							}
							data = data.replace(/^\ufeff/, ""); // delete BOM
							try{
								var player = JKFPlayer["parse"+ext.toUpperCase()](data);
								player.goto(Infinity);
								player.goto(0);
								done();
							}catch(e){
								done(e);
							}
						})
					}catch(e){
						done(e);
					}
				});
			}(files[i]));
		}
	});
}
function loadUTF(filename, cb){
	fs.readFile(filename, {encoding:"utf-8"}, cb);
}
function loadSJIS(filename, cb){
	fs.readFile(filename, function(err, data){
		if(err){
			cb(err);
			return;
		}
		cb(null, sjisIconv.convert(data).toString());
	});
}
function loadAuto(filename, cb){
	fs.readFile(filename, function(err, data){
		if(err){
			cb(err);
			return;
		}
		iconv = new Iconv(jschardet.detect(data).encoding, "utf-8");
		cb(null, iconv.convert(data).toString());
	});
}
