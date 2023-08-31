module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.pegjs$": "<rootDir>/test/pegjs-jest.js",
    },
    testRegex: "((\\.|/)(test|spec))\\.(jsx?|tsx?)$",
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
        "!**/__snapshots__/**",
        "!**/*.d.ts",
        "!src/main.ts",
        "!src/peg/**",
    ],
    snapshotSerializers: ["./test/board-serializer.js"],
};
