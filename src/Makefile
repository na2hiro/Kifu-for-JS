all: uglify
	jsx kifu.jsx > ../out/kifu.js
	cat ./copyright.txt ../json-kifu-format/out/kifuplayer.js ../lib/react.min.js ../lib/ReactDND.min.js ../out/kifu.js > ../out/kifuforjs.js
#	uglifyjs --comments -c -o kifuforjs.min.js kifuforjs.js
uglify:
	uglifyjs --comments -c -o ../out/bookmarklet.min.js bookmarklet.js
	uglifyjs --comments -c -o public-bookmarklet.min.js public-bookmarklet.js
