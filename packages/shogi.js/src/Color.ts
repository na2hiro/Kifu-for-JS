/**
 * 先後番を表すクラス
 *
 * `Black` は先手で、 `White` は後手である．
 */
enum Color {
    Black,
    White,
}
export default Color;

export function colorToString(color: Color): string {
    switch (color) {
        case Color.Black:
            return "先手";
        case Color.White:
            return "後手";
    }
}
