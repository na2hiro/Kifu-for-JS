all: kif ki2 csa

kif: kif-parser.pegjs
	pegjs -e KifParser kif-parser.pegjs
ki2: ki2-parser.pegjs
	pegjs -e Ki2Parser ki2-parser.pegjs
csa: csa-parser.pegjs
	pegjs -e CsaParser csa-parser.pegjs
