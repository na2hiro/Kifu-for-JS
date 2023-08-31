import { render, screen, within } from "@testing-library/react";
import "jest";
import * as React from "react";

import { expectCell, selectPiece } from "../../test/testutils";
import Kifu from "./Kifu";

const PADDING = "\xa0";

const selectKifuList = () => screen.findByRole("listbox");
const selectKifuListRows = async () => {
    const kifuList = await selectKifuList();
    return await within(kifuList).findAllByRole("option");
};
const selectCurrentRow = async () => {
    const kifuList = await selectKifuList();
    return await within(kifuList).findByRole("option", { selected: true });
};
const clickFlipButton = async () => {
    const button = await screen.findByRole("button", { name: "反転" });
    button.click();
};
const clickForwardButton = async () => {
    const button = await screen.findByRole("button", { name: ">" });
    button.click();
};
const clickBackwardButton = async () => {
    const button = await screen.findByRole("button", { name: "<" });
    button.click();
};

const expectCurrentKifuListRow = async (expected: string) => {
    expect((await selectCurrentRow()).textContent).toBe(`${PADDING}${expected} `);
};

const SAMPLE_KI2 = "▲７六歩△８四歩";
const SAMPLE_HANDS_KI2 = "▲７六歩△３四歩▲２二角成△同銀";

describe("<Kifu />", () => {
    it("renders empty state", async () => {
        render(<Kifu />);
        await expectCell(1, 1, "後手 香");
        await expectCell(7, 7, "先手 歩");
        await expectCell(7, 6, "空き");
    });
    it("renders with kifu", async () => {
        render(<Kifu kifu={SAMPLE_KI2} />);
        expect(await selectKifuListRows()).toHaveLength(3);
        await expectCurrentKifuListRow(" 開始局面");
    });
    it("renders hands", async () => {
        render(<Kifu kifu={SAMPLE_HANDS_KI2} />);
        // TODO: Use KifuStore to control player
        await clickForwardButton();
        await clickForwardButton();
        await clickForwardButton();

        const hand = await screen.findByTestId("hand-for-0");
        expect(hand).toHaveTextContent(/☗/);
        const hands = await within(hand).findAllByTestId("piece-in-hand");
        expect(hands.map((hand) => hand.getAttribute("aria-label"))).toContain("角");
    });
});
describe("Control panel", () => {
    it("forward", async () => {
        render(<Kifu kifu={SAMPLE_KI2} />);
        expect(await selectKifuListRows()).toHaveLength(3);

        await clickForwardButton();

        await expectCurrentKifuListRow("1 ☗７六歩");
        await expectCell(7, 7, "空き");
        await expectCell(7, 6, "先手 歩");

        await clickForwardButton();

        await expectCurrentKifuListRow("2 ☖８四歩");
    });
    it("backward", async () => {
        render(<Kifu kifu={SAMPLE_KI2} />);
        expect(await selectKifuListRows()).toHaveLength(3);

        await clickForwardButton();
        await clickForwardButton();
        await expectCurrentKifuListRow("2 ☖８四歩");

        await clickBackwardButton();
        await expectCurrentKifuListRow("1 ☗７六歩");

        await clickBackwardButton();
        await expectCurrentKifuListRow(" 開始局面");
    });
    it("flip", async () => {
        render(<Kifu kifu={SAMPLE_KI2} />);
        await clickForwardButton();
        await expectCell(7, 7, "空き");
        await expectCell(7, 6, "先手 歩");

        await clickFlipButton();
        await expectCell(7, 7, "後手 歩");
        await expectCell(7, 6, "空き");

        await clickFlipButton();
        await expectCell(7, 7, "空き");
        await expectCell(7, 6, "先手 歩");
    });
});
