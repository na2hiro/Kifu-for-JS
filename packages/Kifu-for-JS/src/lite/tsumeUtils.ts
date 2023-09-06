import { pieceHistogram } from "shogi.js/cjs/presets";
import { Piece } from "shogi.js";
import { JKFPlayer } from "json-kifu-format";

export function shouldHideKingsHand(player: JKFPlayer) {
    if (!player.kifu.initial?.data) {
        return false;
    }
    const { hands, board } = player.kifu.initial.data;

    const histogram: { [kind: string]: number } = {};
    hands.forEach((hand) => {
        Object.entries(hand).forEach(([kind, count]) => {
            addToHistogram(kind, count);
        });
    });
    board.forEach((row) => {
        row.forEach((piece) => {
            if (piece.kind) {
                addToHistogram(Piece.unpromote(piece.kind), 1);
            }
        });
    });

    function addToHistogram(kind, count) {
        histogram[kind] = (histogram[kind] ?? 0) + count;
    }

    // Single king or both king
    return allMatches(pieceHistogram, histogram) || allMatches({ ...pieceHistogram, OU: 1 }, histogram);

    function allMatches(thisHistogram, thatHistogram) {
        for (const kind in thisHistogram) {
            if (thatHistogram[kind] !== thisHistogram[kind]) {
                return false;
            }
        }
        return true;
    }
}

const TSUME_HEADERS = ["作品番号", "作品名", "作者", "手数", "完全性", "発表誌", "発表年月", "発表日付"];

export function isTsume(player: JKFPlayer) {
    return (
        player.kifu?.initial?.data &&
        (player.kifu.moves[player.kifu.moves.length - 1]?.special === "TSUMI" ||
            TSUME_HEADERS.some((k) => player.kifu.header[k]?.length > 0))
    );
}
