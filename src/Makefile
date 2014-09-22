all: uglify
	cat ../json-kifu-format/src/kifuplayer.js ./kifu.js > kifuforjs.js
uglify:
	uglifyjs -c -o bookmarklet.min.js bookmarklet.js
	uglifyjs -c -o public-bookmarklet.min.js public-bookmarklet.js
