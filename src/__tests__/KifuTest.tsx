import { mount, ReactWrapper } from "enzyme";
import "jest";
import * as React from "react";

import Kifu from "../Kifu";
import Piece from "../Piece";

const selectKifuList = (wrapper: ReactWrapper) => wrapper.find("select.kifulist");
const selectPiece = (wrapper: ReactWrapper, x: number, y: number) => wrapper.find(Piece).at((y - 1) * 9 + (9 - x));
const selectFlipButton = (wrapper: ReactWrapper) => wrapper
            .find(".inline.tools li")
            .at(0)
            .find("button");
const selectForwardButton = (wrapper: ReactWrapper) => wrapper.find('button[data-go="1"]');
const selectBackwardButton = (wrapper: ReactWrapper) => wrapper.find('button[data-go="-1"]');

describe("<Kifu />", () => {
    const SAMPLE_KI2 = "▲７六歩△８四歩";
    it("renders without problem", () => {
        const wrapper = mount(<Kifu />);
        expect(wrapper.find("table.kifuforjs").exists()).toBeTruthy();
        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({ color: 0, kind: "FU" });
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({});
    });
    it("kifu", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2} />);
        const kifuList = selectKifuList(wrapper);
        expect(kifuList.children()).toHaveLength(3);
        expect((kifuList.getDOMNode() as HTMLSelectElement).value).toBe("0");
    });
    it("forward", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2} />);
        const kifuList = selectKifuList(wrapper);
        expect(kifuList.children().length).toBe(3);

        selectForwardButton(wrapper).simulate("click");

        expect((kifuList.getDOMNode() as HTMLSelectElement).value).toBe("1");
        expect(selectPiece(wrapper, 7, 7).prop("data")).toEqual({});
        expect(selectPiece(wrapper, 7, 6).prop("data")).toEqual({ color: 0, kind: "FU" });

        selectForwardButton(wrapper).simulate("click");

        expect((kifuList.getDOMNode() as HTMLSelectElement).value).toBe("2");
    });
    it("backward", () => {
        const wrapper = mount(<Kifu kifu={SAMPLE_KI2} />);
        const kifuList = selectKifuList(wrapper);
        expect(kifuList.children().length).toBe(3);

        selectForwardButton(wrapper).simulate("click");
        selectForwardButton(wrapper).simulate("click");

        expect((kifuList.getDOMNode() as HTMLSelectElement).value).toBe("2");

        selectBackwardButton(wrapper).simulate("click");

        expect((kifuList.getDOMNode() as HTMLSelectElement).value).toBe("1");

        selectBackwardButton(wrapper).simulate("click");

        expect((kifuList.getDOMNode() as HTMLSelectElement).value).toBe("0");
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
