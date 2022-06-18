import {resolve as _resolve} from "path";
import merge from "webpack-merge";
import CleanWebpackPlugin from "clean-webpack-plugin";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
import {version} from "./package.json";

export default (env) => {
    const IS_ANALYZE = env && env.analyze;
    const common = {
        entry: {
            filename: _resolve(__dirname, "./src/main.ts"),
            //filename: path.resolve(__dirname, './src/tst.js'),
            //hoge: path.resolve(__dirname, './src/csa-parser.pegjs')
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.pegjs$/,
                    use: "pegjs-loader",
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js", ".pegjs"],
        },
        mode: "production",
    };

    // For browsers
    const BUNDLE_DIR = _resolve(__dirname, "./bundle");
    const bundle = merge(common, {
        output: {
            library: "JSONKifuFormat",
            filename: `json-kifu-format-${version}.min.js`,
            path: BUNDLE_DIR,
        },
        plugins: [new CleanWebpackPlugin([BUNDLE_DIR])],
        optimization: {
            minimize: true,
        },
    });
    if (IS_ANALYZE) {
        bundle.plugins.push(new BundleAnalyzerPlugin());
    }

    // For npm module
    const DIST_DIR = _resolve(__dirname, "./dist");
    const dist = merge(common, {
        output: {
            libraryTarget: "commonjs2",
            filename: "json-kifu-format.js",
            path: DIST_DIR,
        },
        plugins: [new CleanWebpackPlugin([DIST_DIR])],
    });
    return [bundle, dist];
};
