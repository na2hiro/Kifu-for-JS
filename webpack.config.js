const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const package = require('./package.json');

module.exports = env => {
    const IS_ANALYZE = env && env.analyze;
    const common = {
        entry: {
            filename: path.resolve(__dirname, './src/main.ts'),
            //filename: path.resolve(__dirname, './src/tst.js'),
            //hoge: path.resolve(__dirname, './src/csa-parser.pegjs')
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.pegjs$/,
                    use: 'pegjs-loader'
                },
            ]
        },
        resolve: {
            extensions: ['.ts', '.js', '.pegjs']
        },
    };

    // For browsers
    const BUNDLE_DIR = path.resolve(__dirname, './bundle');
    const bundle = merge(common, {
        output: {
            library: "JSONKifuFormat",
            filename: `json-kifu-format-${package.version}.min.js`,
            path: BUNDLE_DIR
        },
        plugins: [
            new CleanWebpackPlugin([BUNDLE_DIR]),
            new webpack.optimize.UglifyJsPlugin()
        ]
    });
    if (IS_ANALYZE) {
        bundle.plugins.push(new BundleAnalyzerPlugin());
    }

    // For npm module
    const DIST_DIR = path.resolve(__dirname, './dist');
    const dist = merge(common, {
        output: {
            libraryTarget: "commonjs2",
            filename: 'json-kifu-format.js',
            path: DIST_DIR
        },
        plugins: [
            new CleanWebpackPlugin([DIST_DIR])
        ]
    });
    return [bundle, dist];
};
