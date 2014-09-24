all: uglify
	cat ./kifu.js ../json-kifu-format/src/kifuplayer.js > kifuforjs.js
	uglifyjs -comments -c -o kifuforjs.min.js kifuforjs.js
uglify:
	uglifyjs -comments -c -o bookmarklet.min.js bookmarklet.js
	uglifyjs -comments -c -o public-bookmarklet.min.js public-bookmarklet.js
