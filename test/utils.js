var utils = {};

utils.sortMoves = function (moves) {
	return moves.sort(function (a, b) {
		if (a.from) {
			if (b.from) {
				return dic(compareXY(a.from, b.from), compareXY(a.to, b.to));
			} else {
				return 1;
			}
		} else {
			if (b.from) {
				return -1;
			} else {
				return dic(kindToNum(a.kind) - kindToNum(b.kind), compareXY(a.to, b.to));
			}
		}
	});

	function compareXY(a, b) {
		return dic(a.x - b.x, a.y - b.y);
	}

	function dic(a, b) {
		return a !== 0 ? a : b;
	}

	function kindToNum(kind) {
		return ["FU", "KY", "KE", "GI", "KI", "KA", "HI", "OU"].indexOf(kind);
	}
}

utils.boardBitMapToXYs = function (boardBitMap) {
	var boardRows = boardBitMap.split("\n");
	var ret = {};
	for (var y = 0; y < boardRows.length; y++) {
		var row = boardRows[y];
		for (var x = 0; x < row.length; x++) {
			var char = row[x];
			if (!ret[char]) {
				ret[char] = [];
			}
			ret[char].push({x: row.length - x, y: y + 1});
		}
	}
	return ret;
};

module.exports = utils;