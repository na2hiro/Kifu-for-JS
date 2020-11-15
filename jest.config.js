module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    moduleNameMapper: {
        "\\.(png|css)$": "<rootDir>/__mocks__/fileMock.js",
    },
    setupFiles: ["./test/jestsetup.ts"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    coverageThreshold: {
        global: {
            statements: -94,
            branches: -65,
            lines: -91,
            functions: -34,
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
