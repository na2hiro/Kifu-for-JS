module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    transformIgnorePatterns: [
        "/node_modules/", ".scss$"
    ],
    testRegex: "(/__tests__/.*|src/.*(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    testEnvironment: "jsdom",
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
            statements: -179,
            branches: -115,
            lines: -175,
            functions: -51,
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
};
