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
            statements: -91,
            branches: -65,
            lines: -86,
            functions: -26,
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**",
        "!**/__tests__/**",
        "!**/*.d.ts",
        "!src/main.ts",
        "!src/peg/**"
    ]
};
