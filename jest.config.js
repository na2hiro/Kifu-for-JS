module.exports = {
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    coverageThreshold: {
        global: {
            branches: -6,
            functions: -1,
            lines: -3,
            statements: -5
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**",
        "!**/__tests__/**",
        "!**/*.d.ts",
        "!src/polyfills.ts"
    ]
};
