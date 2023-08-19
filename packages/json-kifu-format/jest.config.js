module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.pegjs$": "<rootDir>/test/pegjs-jest.js",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    coverageThreshold: {
        global: {
            branches: -7,
            functions: -1,
            lines: -5,
            statements: -5,
        },
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**",
        "!**/__tests__/**",
        "!**/*.d.ts",
        "!src/main.ts",
        "!src/peg/**",
    ],
    snapshotSerializers: ["./test/board-serializer.js"],
};
