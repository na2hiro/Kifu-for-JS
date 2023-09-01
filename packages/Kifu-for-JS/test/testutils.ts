import { screen, within } from "@testing-library/react";

export const selectPiece = async (x: number, y: number) => {
    const board = await screen.findByTestId("board");
    const pieces = await within(board).findAllByTestId("piece");
    return pieces[(y - 1) * 9 + (9 - x)];
};

export async function expectCell(x: number, y: number, expected: string) {
    const cellElement = await selectPiece(x, y);
    expect(cellElement).toHaveAttribute("aria-label", expected);
}
