module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "((\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "js", "json"],
    coverageThreshold: {
        global: {
            branches: -1,
            functions: -2,
            lines: -1,
            statements: -1,
        },
    },
    collectCoverage: true,
    collectCoverageFrom: ["src/**", "!src/Kind.ts", "!**/__snapshots__/**", "!src/polyfills.ts"],
};
