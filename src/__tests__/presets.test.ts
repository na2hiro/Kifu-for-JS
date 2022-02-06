import presets, {getInitialFromPreset} from "../presets";

describe("preset", () => {
    it("initialized board", () => {
        for (const preset of presets) {
            expect(getInitialFromPreset(preset)).toMatchSnapshot(preset);
        }
    });
});
