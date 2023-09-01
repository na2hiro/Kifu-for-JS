import {Color, Piece, Shogi} from "shogi.js";
import {IMoveMoveFormat} from "./Formats";
import {JKFPlayer} from "./main";
import {addRelativeInformation, filterMovesByRelatives} from "./normalizer";

const emptyLine = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
describe("module Normalizer (relative information test from https://www.shogi.or.jp/faq/kihuhyouki.html)", () => {
    describe("上寄引", () => {
        run("KI", [93, 72], 82, ["上", "寄"]);
        run("KI", [43, 31], 32, ["上", "引"]);
        run("KI", [56, 45], 55, ["上", "寄"]);
        run("GI", [89, 77], 88, ["上", "引"]);
        run("GI", [49, 27], 38, ["上", "引"]);
    });
    describe("左右", () => {
        run("KI", [92, 72], 81, ["左", "右"]);
        run("KI", [32, 12], 22, ["左", "右"]);
        run("GI", [65, 45], 56, ["左", "右"]);
        run("KI", [89, 79], 78, ["左", "直"]);
        run("GI", [39, 29], 38, ["直", "右"]);
    });
    describe("3枚", () => {
        run("KI", [63, 53, 43], 52, ["左", "直", "右"]);
        run("TO", [79, 89, 99, 98, 87], 88, ["右", "直", "左上", "寄", "引"]);
        run("GI", [29, 17, 39, 37], 28, ["直", "右", "左上", "左引"]);
    });
    describe("竜", () => {
        run("RY", [91, 84], 82, ["引", "上"]);
        run("RY", [23, 52], 43, ["寄", "引"]);
        run("RY", [55, 15], 35, ["左", "右"]);
        run("RY", [99, 89], 88, ["左", "右"]);
        run("RY", [28, 19], 17, ["左", "右"]);
    });
    describe("馬", () => {
        run("UM", [91, 81], 82, ["左", "右"]);
        run("UM", [95, 63], 85, ["寄", "引"]);
        run("UM", [11, 34], 12, ["引", "上"]);
        run("UM", [99, 59], 77, ["左", "右"]);
        run("UM", [47, 18], 29, ["左", "右"]);
    });
    // eslint-disable-next-line jest/no-identical-title
    describe("馬", () => {
        run("UM", [93, 74], 92, ["左", "右"]);
    });
});

function run(piece, coords, toCoord, expected) {
    describe(`${coords.join(", ")} ${piece} to ${toCoord}`, () => {
        const shogi = new Shogi({
            preset: "OTHER",
            data: {
                board: [
                    emptyLine,
                    emptyLine,
                    emptyLine,
                    emptyLine,
                    emptyLine,
                    emptyLine,
                    emptyLine,
                    emptyLine,
                    emptyLine,
                ],
                color: 0,
                hands: [
                    {FU: 18, KY: 4, KE: 4, GI: 4, KI: 4, KA: 2, HI: 2},
                    {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0},
                ],
            },
        });
        shogi.editMode(true);
        coords.forEach((coord) => {
            const {x, y} = coordToXY(coord);
            if (Piece.isPromoted(piece)) {
                shogi.drop(x, y, Piece.unpromote(piece), Color.Black);
                shogi.flip(x, y);
            } else {
                shogi.drop(x, y, piece, Color.Black);
            }
        });
        shogi.editMode(false);
        const to = coordToXY(toCoord);
        const movesTo = shogi.getMovesTo(to.x, to.y, piece, Color.Black);
        coords.forEach((coord, i) => {
            it(`${coord}`, () => {
                const from = coordToXY(coord);
                const move: IMoveMoveFormat = {
                    from,
                    to,
                    color: Color.Black,
                    piece,
                };
                addRelativeInformation(shogi, move);
                expect((move.relative || "").split("").map(JKFPlayer.relativeToKan).join("")).toBe(
                    expected[i]
                );

                const found = filterMovesByRelatives(move.relative, Color.Black, movesTo);
                expect(found).toHaveLength(1);
                expect(found[0].from).toEqual(from);
            });
        });
    });
}
function coordToXY(coord: number) {
    return {
        x: Math.floor(coord / 10),
        y: coord % 10,
    };
}
