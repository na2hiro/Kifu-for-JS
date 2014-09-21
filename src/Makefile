all: kif ki2 csa

kif: kif-parser.pegjs
	pegjs -e JKFPlayer.kifParser kif-parser.pegjs
ki2: ki2-parser.pegjs
	pegjs -e JKFPlayer.ki2Parser ki2-parser.pegjs
csa: csa-parser.pegjs
	pegjs -e JKFPlayer.csaParser csa-parser.pegjs
