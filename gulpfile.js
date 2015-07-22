var gulp = require('gulp');
var typescript = require('gulp-typescript');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var webserver = require('gulp-webserver')

gulp.task('build', function(){
	gulp.src('./src/shogi.ts')
		.pipe(typescript({module: "commonjs"}))
		.pipe(gulp.dest('./src/'));
});

gulp.task('test', function(cb){
	// variable is necessary because of gulp-istanbul bug: https://github.com/SBoudrias/gulp-istanbul/issues/40
	var coverageVariable = '$$cov_' + new Date().getTime() + '$$';
	gulp.src(['./src/shogi.js'])
		.pipe(istanbul({coverageVariable: coverageVariable}))
		.pipe(istanbul.hookRequire())
		.on('finish', function(){
			gulp.src('./test/*.js')
				.pipe(mocha({}))
				.on("error", handleError)
				.pipe(istanbul.writeReports({
					coverageVariable: coverageVariable,
					reporters: ['lcov','text-summary']
				}))
				.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
				.on('finish', cb)
		});
});

gulp.task('default', ['serve'], function(){
	gulp.watch('./src/shogi.ts', ['build', 'test']);
	gulp.watch('./test/*.js', ['test']);
});

gulp.task('serve', ['test'], function(){
	gulp.src('coverage/lcov-report')
		.pipe(webserver({
			livereload: true,
			open: true
		}));
});

function handleError(err){
	this.emit("end");
}
