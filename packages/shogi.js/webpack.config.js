const path = require("path");
const webpack = require("webpack");
const {merge} = require("webpack-merge");
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");
const pkg = require("./package.json");

module.exports = (env) => {
    const IS_ANALYZE = env && env.analyze;
    const common = {
        entry: {
            filename: path.resolve(__dirname, "./src/shogi.ts"),
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "ts-loader",
                        options: {},
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
    };

    // For browsers
    const BUNDLE_DIR = path.resolve(__dirname, "./bundle");
    const bundle = merge(common, {
        output: {
            library: "ShogiJS",
            filename: `shogi-${pkg.version}.min.js`,
            path: BUNDLE_DIR,
            clean: true,
        },
        optimization: {
            minimize: true,
        },
    });

    if (IS_ANALYZE) {
        bundle.plugins = [new BundleAnalyzerPlugin()];
    }

    /*
    // For cjs module
    const DIST_DIR = path.resolve(__dirname, "./cjs");
    const dist = merge(common, {
        output: {
            libraryTarget: "commonjs2",
            filename: "shogi.js",
            path: DIST_DIR,
            clean: true,
        },
    });

     */
    return [bundle /*, dist*/];
};
