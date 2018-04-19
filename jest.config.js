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
            branches: -1,
            functions: -1,
            lines: -1,
            statements: -1
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
