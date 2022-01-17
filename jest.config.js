module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    coverageThreshold: {
        global: {
            branches: -1,
            functions: -1,
            lines: -1,
            statements: -1,
        },
    },
    collectCoverage: true,
    collectCoverageFrom: ["src/**", "!src/Kind.ts", "!**/__tests__/**", "!src/polyfills.ts"],
};
