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

var SRC_FILE = './src/*.ts';
var TEST_FILE = "./test/*.js";
var PEG_FILE = "./src/*.pegjs";
var LIB_DIR = "./lib/";
var PLAYER_NODE_FILE = LIB_DIR+"player.js";
var LIB_FILE = LIB_DIR+"*.js";
var OUT_DIR = "./out/";
var PARSER_FILE = 'out/*-parser.js';
var COVERAGE_DIR = "./coverage/";
var BROWSERIFY_OUT_NAME = 'kifuplayer.js';
var BROWSERIFY_OUT_FILE = OUT_DIR+BROWSERIFY_OUT_NAME;

gulp.task('clean', ['clean-lib', 'clean-peg', 'clean-browserify', 'clean-coverage']);
gulp.task('clean-lib', function(cb){
	del([LIB_DIR+"*"], cb);
});
gulp.task('clean-peg', function(cb){
	del([PARSER_FILE], cb);
});
gulp.task('clean-browserify', function(cb){
	del([BROWSERIFY_OUT_FILE], cb);
});
gulp.task('clean-coverage', function(cb){
	del([COVERAGE_DIR+"lcov-report/*", "!"+COVERAGE_DIR+"lcov-report/404.html"], cb);
});

gulp.task('default', ['serve'], function(){
	gulp.watch(SRC_FILE, ['typescript']); // will change LIB_FILE
	gulp.watch(PEG_FILE, ['peg']); // will change PARSER_FILE
	gulp.watch([PARSER_FILE, LIB_FILE], ['test-without-build-node', 'browserify-without-node']);
	gulp.watch(TEST_FILE, ['test-without-build-node']);
	gulp.watch(PLAYER_NODE_FILE, ['browserify-without-node']);
});

gulp.task('build-node', ['typescript', 'peg']);

gulp.task('typescript', ['clean-lib'], function(cb){
	var error = false;
	var result = gulp.src([SRC_FILE])
		.pipe(typescript({
			module: "commonjs",
			declarationFiles: true,
			noEmitOnError: true,
			outDir: LIB_DIR
		})).on("error", function(err){
			error = true;
			cb(err);
		});
	merge([result.dts, result.js])
		.pipe(gulp.dest(LIB_DIR))
		.on("finish", function(){
			// prevent cb being called twice when error occurs
			if(!error) cb();
		})
});

gulp.task('peg', ['clean-peg'], function(){
	return gulp.src([PEG_FILE])
		.pipe(peg())
		.pipe(gulp.dest(OUT_DIR));
});

gulp.task('build', ['build-node', 'clean-browserify'], buildBrowserify);
gulp.task('browserify-without-node', ['clean-browserify'], buildBrowserify);
function buildBrowserify(){
	return browserify(PLAYER_NODE_FILE)
		.bundle()
		.pipe(source(BROWSERIFY_OUT_NAME))
		.pipe(gulp.dest(OUT_DIR));
}

gulp.task('test', ['build-node','clean-coverage'], test);
gulp.task('test-without-build-node', test);
function test(cb){
	// variable is necessary because of gulp-istanbul bug: https://github.com/SBoudrias/gulp-istanbul/issues/40
	var coverageVariable = '$$cov_' + new Date().getTime() + '$$';
	gulp.src([LIB_FILE])
		.pipe(istanbul({coverageVariable: coverageVariable}))
		.pipe(istanbul.hookRequire())
		.on('finish', function(){
			gulp.src(TEST_FILE)
				.pipe(mocha({}))
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
