import { mount, ReactWrapper } from "enzyme";
import "jest";
import * as React from "react";

import Kifu from "../Kifu";
import Piece from "../Piece";
import Hand from "../Hand";
import PieceHandGroup from "../PieceHandGroup";

const selectKifuList = (wrapper: ReactWrapper) => wrapper.find(".kifuforjs-kifulist-inner");
const KIFU_LIST_PADDER_COUNT = 2;
const selectCurrentRow = (kifuList: ReactWrapper) => kifuList.find(".kifuforjs-kifulist-row--selected");
const selectPiece = (wrapper: ReactWrapper, x: number, y: number) => wrapper.find(Piece).at((y - 1) * 9 + (9 - x));
const selectFlipButton = (wrapper: ReactWrapper) => wrapper
            .find("button.kifuforjs-control-tools")
            .at(0);
const selectForwardButton = (wrapper: ReactWrapper) => wrapper.find('button[data-go="1"]');
const selectBackwardButton = (wrapper: ReactWrapper) => wrapper.find('button[data-go="-1"]');

const SAMPLE_KI2 = "▲７六歩△８四歩";
const SAMPLE_HANDS_KI2 = "▲７六歩△３四歩▲２二角成△同銀";

describe("<Kifu />", () => {
    it("renders empty state", () => {
        const wrapper = mount(<Kifu/>);
        expect(wrapper.find(".kifuforjs").exists()).toBeTruthy();
        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({color: 0, kind: "FU"});
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({});
    });
    it("renders with kifu", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2}/>);
        const kifuList = selectKifuList(wrapper);
        expect(kifuList.children()).toHaveLength(3 + KIFU_LIST_PADDER_COUNT);
        expect(selectCurrentRow(kifuList).text()).toBe("\xa0\xa0\xa00 開始局面 ");
    });
    it("renders hands", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_HANDS_KI2} />);
        // TODO: Use KifuStore to controll player
        selectForwardButton(wrapper).simulate("click");
        selectForwardButton(wrapper).simulate("click");
        selectForwardButton(wrapper).simulate("click");

        const hand = wrapper.find(Hand).filterWhere(hand => hand.prop("defaultColor")===0);
        const fu = hand.find(PieceHandGroup).filterWhere(group => group.key()==="KA");
        expect(fu.prop("value")).toBe(1);
    });
});
describe("Control panel", () => {
    it("forward", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2} />);
        const kifuList = selectKifuList(wrapper);
        expect(kifuList.children().length).toBe(3 + KIFU_LIST_PADDER_COUNT);

        const reactWrapper = selectForwardButton(wrapper);
        reactWrapper.simulate("click");

        expect(selectCurrentRow(wrapper).text()).toBe("\xa0\xa0\xa01 ☗７六歩 ");
        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({});
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({ color: 0, kind: "FU" });

        selectForwardButton(wrapper).simulate("click");

        expect(selectCurrentRow(wrapper).text()).toBe("\xa0\xa0\xa02 ☖８四歩 ");
    });
    it("backward", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2} />);
        const kifuList = selectKifuList(wrapper);
        expect(kifuList.children().length).toBe(3 + KIFU_LIST_PADDER_COUNT);

        selectForwardButton(wrapper).simulate("click");
        selectForwardButton(wrapper).simulate("click");

        expect(selectCurrentRow(wrapper).text()).toBe("\xa0\xa0\xa02 ☖８四歩 ");

        selectBackwardButton(wrapper).simulate("click");

        expect(selectCurrentRow(wrapper).text()).toBe("\xa0\xa0\xa01 ☗７六歩 ");

        selectBackwardButton(wrapper).simulate("click");

        expect(selectCurrentRow(wrapper).text()).toBe("\xa0\xa0\xa00 開始局面 ");
    });
    it("flip", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2} />);
        selectForwardButton(wrapper).simulate("click");

        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({});
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({ color: 0, kind: "FU" });

        selectFlipButton(wrapper).simulate("click");

        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({ color: 1, kind: "FU" });
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({});

        selectFlipButton(wrapper).simulate("click");

        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({});
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({ color: 0, kind: "FU" });
    });
});
