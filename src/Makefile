all: merge

kif: kif-parser.pegjs
	pegjs -e JKFPlayer.kifParser kif-parser.pegjs
ki2: ki2-parser.pegjs
	pegjs -e JKFPlayer.ki2Parser ki2-parser.pegjs
csa: csa-parser.pegjs
	pegjs -e JKFPlayer.csaParser csa-parser.pegjs
merge: kif ki2 csa
	cat ../Shogi.js/src/shogi.js player.js normalizer.js kif-parser.js ki2-parser.js csa-parser.js > kifuplayer.js

