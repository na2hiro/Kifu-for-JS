import {Kind, values} from "./Kind";
import {getMoveDefinitions} from "./moveDefinitions";

describe("move def", () => {
    it("snapshots", () => {
        for (const kind of values) {
            expect(getMoveDefinitions(kind as Kind)).toMatchSnapshot(kind);
        }
    });
});
