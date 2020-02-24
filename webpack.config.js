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
            filename: path.resolve(__dirname, './src/shogi.ts')
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {

                        }
                    },
                    exclude: /node_modules/,
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
    };

    // For browsers
    const BUNDLE_DIR = path.resolve(__dirname, './bundle');
    const bundle = merge(common, {
        output: {
            library: "ShogiJS",
            filename: `shogi-${package.version}.min.js`,
            path: BUNDLE_DIR
        },
        plugins: [
            new CleanWebpackPlugin([BUNDLE_DIR])
        ],
        optimization: {
            minimize: true
        }
    });

    if (IS_ANALYZE) {
        bundle.plugins.push(new BundleAnalyzerPlugin());
    }

    // For npm module
    const DIST_DIR = path.resolve(__dirname, './dist');
    const dist = merge(common, {
        output: {
            libraryTarget: "commonjs2",
            filename: 'shogi.js',
            path: DIST_DIR
        },
        plugins: [
            new CleanWebpackPlugin([DIST_DIR])
        ]
    });
    return [bundle, dist];
};
