var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var uglify = require("gulp-uglify");
var uglifyify = require("uglifyify");
var watchify = require("watchify");
var rename = require("gulp-rename");
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var merge = require('merge2');
var streamify = require('gulp-streamify');

var BROWSERIFY_SRC_FILE = "./src/kifu.jsx";
var BROWSERIFY_OUT_NAME = "./kifuforjs.js";
var BROWSERIFY_OUT_DIR = "./out/";
var UGLIFY_SRC_FILE = "./src/*bookmarklet.js";
var UGLIFY_OUT_DIR = "./out/";
var COPYRIGHT_FILE = "./src/copyright.txt";

gulp.task("build", ["browserify", "uglify"]);

function getBrowserify(watch){
	var b = (watch ? watchify : id)(browserify({
		cache:{}, packageCache: {}, fullPath: true // for watchify
	}))
		.require(BROWSERIFY_SRC_FILE, {expose: "Kifu"})
		.transform(babelify)
		.transform({global: true}, uglifyify)
		.on('log', console.log.bind(console, "browserify finished"))
		.on("update", bundle);
	return bundle;
	function bundle() {
		console.log("browserify starting");
		return merge(gulp.src(COPYRIGHT_FILE), b.bundle()
			.on('error', function(e){
				console.error("browserify", e.toString())
			})
			.pipe(source("dummy")))
			.pipe(streamify(concat(BROWSERIFY_OUT_NAME)))
			.on('error', function(e){
				console.error("browserify", e.toString())
			})
			.pipe(gulp.dest(BROWSERIFY_OUT_DIR));
	}
	function id(b){return b}
};
gulp.task("browserify", getBrowserify(false));
gulp.task("uglify", function () {
	return gulp.src(UGLIFY_SRC_FILE)
		.pipe(uglify({preserveComments:"some"}))
		.pipe(rename({extname:".min.js"}))
		.pipe(gulp.dest(UGLIFY_OUT_DIR));
});
gulp.task("watch", function(){
	gulp.watch(UGLIFY_SRC_FILE, ["uglify"]);
	getBrowserify(true)();
});
