import Color from "./Color";
import {PRESET} from "./Constants";
import Piece from "./Piece";
import {ISettingType, Shogi} from "./shogi";

export function fromPreset(shogi: Shogi, setting: ISettingType) {
    const board = [];
    const hands = [[], []];
    let turn;
    if (setting.preset !== "OTHER") {
        for (let i = 0; i < 9; i++) {
            board[i] = [];
            for (let j = 0; j < 9; j++) {
                const csa: string = PRESET[setting.preset].board[j].slice(
                    24 - i * 3,
                    24 - i * 3 + 3
                );
                board[i][j] = csa === " * " ? null : new Piece(csa);
            }
        }
        turn = PRESET[setting.preset].turn;
    } else {
        for (let i = 0; i < 9; i++) {
            board[i] = [];
            for (let j = 0; j < 9; j++) {
                const p = setting.data.board[i][j];
                board[i][j] = p.kind
                    ? new Piece((p.color === Color.Black ? "+" : "-") + p.kind)
                    : null;
            }
        }
        turn = setting.data.color;
        for (let c = 0; c < 2; c++) {
            for (const k in setting.data.hands[c]) {
                // eslint-disable-next-line no-prototype-builtins
                if (setting.data.hands[c].hasOwnProperty(k)) {
                    const csa = (c === 0 ? "+" : "-") + k;
                    for (let i = 0; i < setting.data.hands[c][k]; i++) {
                        hands[c].push(new Piece(csa));
                    }
                }
            }
        }
    }
    shogi.board = board;
    shogi.turn = turn;
    shogi.hands = hands;
}

export function toCSA(shogi: Shogi) {
    const ret = [];
    for (let y = 0; y < 9; y++) {
        let line = "P" + (y + 1);
        for (let x = 8; x >= 0; x--) {
            const piece = shogi.board[x][y];
            line += piece == null ? " * " : piece.toCSAString();
        }
        ret.push(line);
    }
    for (let i = 0; i < 2; i++) {
        let line = "P" + "+-"[i];
        for (const hand of shogi.hands[i]) {
            line += "00" + hand.kind;
        }
        ret.push(line);
    }
    ret.push(shogi.turn === Color.Black ? "+" : "-");
    return ret.join("\n");
}

export function fromSfen(shogi: Shogi, sfen: string) {
    const board = [];
    for (let i = 0; i < 9; i++) {
        board[i] = [];
        for (let j = 0; j < 9; j++) {
            board[i][j] = null;
        }
    }
    const segments = sfen.split(" ");
    const sfenBoard = segments[0];
    let x = 8;
    let y = 0;
    for (let i = 0; i < sfenBoard.length; i++) {
        let c = sfenBoard[i];
        if (c === "+") {
            i++;
            c += sfenBoard[i];
        }
        if (c.match(/^[1-9]$/)) {
            x -= Number(c);
        } else if (c === "/") {
            y++;
            x = 8;
        } else {
            board[x][y] = Piece.fromSFENString(c);
            x--;
        }
    }
    shogi.board = board;
    shogi.turn = segments[1] === "b" ? Color.Black : Color.White;
    const hands = [[], []];
    let sfenHands = segments[2];
    if (sfenHands !== "-") {
        while (sfenHands.length > 0) {
            let count = 1;
            const m = sfenHands.match(/^[0-9]+/);
            if (m) {
                count = Number(m[0]);
                sfenHands = sfenHands.slice(m[0].length);
            }
            for (let i = 0; i < count; i++) {
                const piece = Piece.fromSFENString(sfenHands[0]);
                hands[piece.color].push(piece);
            }
            sfenHands = sfenHands.slice(1);
        }
    }
    shogi.hands = hands;
}

export function toSfen(shogi: Shogi, moveCount) {
    const ret = [];
    const sfenBoard = [];
    for (let y = 0; y < 9; y++) {
        let line = "";
        let empty = 0;
        for (let x = 8; x >= 0; x--) {
            const piece = shogi.board[x][y];
            if (piece == null) {
                empty++;
            } else {
                if (empty > 0) {
                    line += "" + empty;
                    empty = 0;
                }
                line += piece.toSFENString();
            }
        }
        if (empty > 0) {
            line += "" + empty;
        }
        sfenBoard.push(line);
    }
    ret.push(sfenBoard.join("/"));
    ret.push(shogi.turn === Color.Black ? "b" : "w");
    if (shogi.hands[0].length === 0 && shogi.hands[1].length === 0) {
        ret.push("-");
    } else {
        let sfenHands = "";
        const kinds = ["R", "B", "G", "S", "N", "L", "P", "r", "b", "g", "s", "n", "l", "p"];
        const count = {};
        for (let i = 0; i < 2; i++) {
            for (const hand of shogi.hands[i]) {
                const key = hand.toSFENString();
                count[key] = (count[key] || 0) + 1;
            }
        }
        for (const kind of kinds) {
            if (count[kind] > 0) {
                sfenHands += (count[kind] > 1 ? count[kind] : "") + kind;
            }
        }
        ret.push(sfenHands);
    }
    ret.push("" + moveCount);
    return ret.join(" ");
}
