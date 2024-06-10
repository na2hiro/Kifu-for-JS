import { handToString } from "./Mochigoma";

describe("Mochigoma", () => {
    it("handToString should match", () => {
        expect(handToString({ FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("なし");
        expect(handToString({ FU: 1, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("歩");
        expect(handToString({ FU: 2, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("歩二");
        expect(handToString({ FU: 9, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("歩九");
        expect(handToString({ FU: 10, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("歩十");
        expect(handToString({ FU: 11, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("歩十一");
        expect(handToString({ FU: 18, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 })).toBe("歩十八");

        expect(handToString({ FU: 5, KY: 4, KE: 3, GI: 2, KI: 1, KA: 0, HI: 1 })).toBe("飛金銀二桂三香四歩五");
    });
});
