all: csa

kif:
	pegjs -e KifParser kif-parser.pegjs
csa:
	pegjs -e CsaParser csa-parser.pegjs
