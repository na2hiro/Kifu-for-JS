import Color, {colorToString} from "./Color";

describe("colorToString", function () {
    it("先手", () => {
        expect(colorToString(Color.Black)).toEqual("先手");
    });
    it("後手", () => {
        expect(colorToString(Color.White)).toEqual("後手");
    });
});
