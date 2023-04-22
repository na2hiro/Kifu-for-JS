module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
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
    collectCoverageFrom: ["src/**", "!src/Kind.ts", "!**/__tests__/**", "!src/polyfills.ts"],
};
