import presets, {getInitialFromPreset} from "./presets";

describe("preset", () => {
    it("initialized board", () => {
        for (const preset of presets) {
            expect(getInitialFromPreset(preset)).toMatchSnapshot(preset);
        }
    });
    it("throws error with invalid preset name", () => {
        expect(() => getInitialFromPreset("invalid")).toThrowErrorMatchingSnapshot();
    });
});
