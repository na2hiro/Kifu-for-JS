var gulp = require('gulp');
var typescript = require('gulp-typescript');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var webserver = require('gulp-webserver');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge2');
var del = require('del');

var SRC_FILE = './src/*.ts';
var TEST_FILE = './test/*.js';
var OUT_DIR = './out/';
var LIB_DIR = './lib/';
var LIB_FILE = LIB_DIR+'shogi.js';
var COVERAGE_DIR = './coverage/';

gulp.task('clean', ['clean-lib', 'clean-out', 'clean-coverage']);
gulp.task('clean-lib', function(cb){
	del([LIB_DIR+"*"], cb);
});
gulp.task('clean-out', function(cb){
	del([OUT_DIR+"*"], cb);
});
gulp.task('clean-coverage', function(cb){
	del([COVERAGE_DIR+"lcov-report/*", "!"+COVERAGE_DIR+"lcov-report/404.html"], cb);
});

gulp.task('typescript', ['clean-lib'], function(cb){
	var error = false;
	var result = gulp.src(SRC_FILE)
		.pipe(typescript({
			module: "commonjs",
			declarationFiles: true,
			noEmitOnError: true,
			outDir: LIB_DIR,
			typescript: require("typescript")
		})).on("error", function(err){
			error=true;
			cb(err);
		});
	merge([result.dts, result.js])
		.pipe(gulp.dest(LIB_DIR))
		.on("finish", function(){
			// prevent cb being called twice when error occurs
			if(!error) cb();
		});
});

gulp.task('build', ['clean-out', 'typescript'], buildBrowserify);
gulp.task('build-without-node', ['clean-out'], buildBrowserify);
function buildBrowserify(){
	return browserify(LIB_FILE)
		.bundle()
		.pipe(source("shogi.js"))
		.pipe(gulp.dest(OUT_DIR))
};

gulp.task('test', ['typescript','clean-coverage'], test);
gulp.task('test-without-build', test);
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

gulp.task('default', ['serve','test'], function(){
	gulp.watch(SRC_FILE, ['test']);
	gulp.watch(TEST_FILE, ['test-without-build']);
	gulp.watch(LIB_FILE, ['build']);
});


gulp.task('serve', function(){
	gulp.src('coverage/lcov-report')
		.pipe(webserver({
			livereload: true,
			open: true,
			fallback:'404.html'
		}));
});
