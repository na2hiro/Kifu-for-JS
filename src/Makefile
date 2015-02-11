all: ts merge

kif: kif-parser.pegjs
	pegjs -e JKFPlayer.kifParser kif-parser.pegjs ../out/kif-parser.js
ki2: ki2-parser.pegjs
	pegjs -e JKFPlayer.ki2Parser ki2-parser.pegjs ../out/ki2-parser.js
csa: csa-parser.pegjs
	pegjs -e JKFPlayer.csaParser csa-parser.pegjs ../out/csa-parser.js
merge: kif ki2 csa
	cat ../out/player.js ../out/kif-parser.js ../out/ki2-parser.js ../out/csa-parser.js post-player.js > ../out/kifuplayer.js
ts: 
	tsc --out ../out/player.js player.ts
test: all
	node ../test/kif-test.js
	node ../test/ki2-test.js
	node ../test/csa-test.js
