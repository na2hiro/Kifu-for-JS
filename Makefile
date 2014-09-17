all: ki2

kif:
	pegjs -e KifParser kif-parser.pegjs
ki2:
	pegjs -e Ki2Parser ki2-parser.pegjs
csa:
	pegjs -e CsaParser csa-parser.pegjs
