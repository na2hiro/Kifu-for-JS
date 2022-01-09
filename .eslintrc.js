module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "ignorePatterns": [
        ".eslintrc.js",
        "jest.config.js",
        "webpack.config.js",
        "docs/",
        "bundle/",
        "dist/"
    ],
    "rules": {}
};
