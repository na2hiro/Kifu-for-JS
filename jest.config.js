module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    transformIgnorePatterns: [
        "/node_modules/", ".scss$"
    ],
    testRegex: "(/__tests__/.*|src/.*(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    moduleNameMapper: {
        "\\.(png|scss)$": "<rootDir>/__mocks__/fileMock.js",
    },
    setupFiles: ["./test/jestsetup.ts"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    coverageThreshold: {
        global: {
            statements: -128,
            branches: -94,
            lines: -125,
            functions: -38,
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**",
        "!src/**/*.min.js",
        "!**/__tests__/**",
        "!**/*.d.ts",
        "!src/main.ts",
        "!src/peg/**"
    ],
    testURL: "http://localhost"
};
