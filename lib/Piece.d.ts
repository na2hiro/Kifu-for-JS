import Color from "./Color";
import MoveDefinition from "./MoveDefinition";
export default class Piece {
    color: Color;
    kind: string;
    constructor(csa: string);
    promote(): void;
    unpromote(): void;
    inverse(): void;
    toCSAString(): string;
    toSFENString(): string;
    static promote(kind: string): string;
    static unpromote(kind: string): string;
    static canPromote(kind: string): boolean;
    static getMoveDef(kind: string): MoveDefinition;
    static isPromoted(kind: string): boolean;
    static oppositeColor(color: Color): Color;
    static fromSFENString(sfen: string): Piece;
}
