var gulp = require('gulp');
var typescript = require('gulp-typescript');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var webserver = require('gulp-webserver');
var peg = require('gulp-peg');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge2');
var del = require('del');

var SRC_DIR = "./src/";
var OUT_DIR = "./out/";
var LIB_DIR = "./lib/";

var PEG_FILE = SRC_DIR+"*.pegjs";
var PEG_OUT_DIR = LIB_DIR;
var PEG_OUT_FILE = PEG_OUT_DIR+'*-parser.js';
var TS_FILE = SRC_DIR+'*.ts';
var TS_OUT_DIR = LIB_DIR;
var TS_OUT_FILE = TS_OUT_DIR+"*([^-]).js"; // filename without "-"
var BROWSERIFY_FILE = LIB_DIR+"jkfplayer.js";
var BROWSERIFY_OUT_DIR = OUT_DIR;
var BROWSERIFY_OUT_NAME = 'jkfplayer.js';
var TEST_FILE = "./test/*.js";
var COVERAGE_DIR = "./coverage/";

gulp.task('clean', ['clean:typescript', 'clean:peg', 'clean:browserify', 'clean:coverage']);
gulp.task('clean:typescript', function(cb){
	del([TS_OUT_FILE], cb);
});
gulp.task('clean:peg', function(cb){
	del([PEG_OUT_FILE], cb);
});
gulp.task('clean:browserify', function(cb){
	del([BROWSERIFY_OUT_DIR+BROWSERIFY_OUT_NAME], cb);
});
gulp.task('clean:coverage', function(cb){
	del([COVERAGE_DIR+"lcov-report/*", "!"+COVERAGE_DIR+"lcov-report/404.html"], cb);
});

gulp.task('default', ['serve'], watch);
gulp.task('watch', watch);
function watch(){
	gulp.watch(TS_FILE, ['typescript']); // will change TS_OUT_FILE
	gulp.watch(PEG_FILE, ['peg']); // will change PEG_OUT_FILE
	gulp.watch([PEG_OUT_FILE, TS_OUT_FILE], ['test:no-build', 'browserify:no-node']);
	gulp.watch(TEST_FILE, ['test:no-build']);
	gulp.watch(BROWSERIFY_FILE, ['browserify:no-node']);
}
gulp.task('build:node', ['typescript', 'peg']);

gulp.task('typescript', ['clean:typescript'], function(cb){
	var error = false;
	var result = gulp.src([TS_FILE])
		.pipe(typescript({
			typescript: require("typescript"),
			module: "commonjs",
			declarationFiles: true,
			noEmitOnError: true,
			outDir: TS_OUT_DIR
		})).on("error", function(err){
			error = true;
			cb(err);
		});
	merge([result.dts, result.js])
		.pipe(gulp.dest(TS_OUT_DIR))
		.on("finish", function(){
			// prevent cb being called twice when error occurs
			if(!error) cb();
		})
});

gulp.task('peg', ['clean:peg'], function(){
	return gulp.src([PEG_FILE])
		.pipe(peg())
		.pipe(gulp.dest(PEG_OUT_DIR));
});

gulp.task('build', ['browserify']);

gulp.task('browserify', ['build:node', 'clean:browserify'], buildBrowserify);
gulp.task('browserify:no-node', ['clean:browserify'], buildBrowserify);
function buildBrowserify(){
	return browserify().require(BROWSERIFY_FILE, {expose:"JKFPlayer"})
		.bundle()
		.pipe(source(BROWSERIFY_OUT_NAME))
		.pipe(gulp.dest(BROWSERIFY_OUT_DIR));
}

gulp.task('test', ['build:node','clean:coverage'], test);
gulp.task('test:no-build', test);
function test(cb){
	// variable is necessary because of gulp-istanbul bug: https://github.com/SBoudrias/gulp-istanbul/issues/40
	var coverageVariable = '$$cov_' + new Date().getTime() + '$$';
	gulp.src([PEG_OUT_FILE, TS_OUT_FILE])
		.pipe(istanbul({coverageVariable: coverageVariable}))
		.pipe(istanbul.hookRequire())
		.on('finish', function(){
			gulp.src(TEST_FILE)
				.pipe(mocha({reporter:"dot"}))
				.on("error", cb)
				.pipe(istanbul.writeReports({
					coverageVariable: coverageVariable,
					reporters: ['lcov','text-summary']
				}))
				.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
				.on('finish', cb);
		});
}

gulp.task('serve', ['test'], function(){
	gulp.src('coverage/lcov-report')
		.pipe(webserver({
			livereload: true,
			open: true,
			fallback:'404.html'
		}));
});
